import React, { useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { AI_PROMPT, SelectBudgetOptions, SelectTravelList } from "@/constants/option";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import TrendingDestinations from "@/components/custom/TrendingDestinations";
import { trendingService } from "@/service/TrendingService";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateTripPlan } from "@/service/AIModel";


// -------------------------------------
// ✅ CLEAN & PARSE AI JSON SAFELY
// -------------------------------------
function cleanAndParseJSON(text) {
  const cleaned = String(text ?? "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    const firstBraceIndex = cleaned.indexOf("{");
    const lastBraceIndex = cleaned.lastIndexOf("}");

    if (firstBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
      const jsonSlice = cleaned.slice(firstBraceIndex, lastBraceIndex + 1);
      try {
        return JSON.parse(jsonSlice);
      } catch (sliceParseError) {
        console.error("❌ JSON Slice Parse Failed:", sliceParseError);
      }
    }

    console.error("❌ JSON Parse Failed:", parseError, text);
    throw new Error("Invalid JSON returned from AI");
  }
}

function hasRealisticTicketPrices(tripJson) {
  const activities = tripJson?.itinerary?.flatMap((day) => day?.activities || []) || [];
  if (activities.length === 0) {
    return false;
  }

  const invalidPattern = /(included|package|extra|varies|n\/a|not available|tbd)/i;
  const numericPattern = /\d/;

  return activities.every((activity) => {
    const ticket = String(activity?.ticket ?? "").trim();
    if (!ticket) {
      return false;
    }

    if (/^free$/i.test(ticket)) {
      return true;
    }

    if (invalidPattern.test(ticket)) {
      return false;
    }

    return numericPattern.test(ticket);
  });
}

function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingGenerateAfterLogin, setPendingGenerateAfterLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getLocationLabel = (value) => {
    if (typeof value === "string") return value;
    if (value?.label) return value.label;
    if (value?.value?.description) return value.value.description;
    if (value?.name) return value.name;
    return "";
  };

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    console.log("📋 FORM DATA:", formData);
  }, [formData]);

  // Handle pre-selected destination from famous places
  useEffect(() => {
    if (location.state?.selectedDestination) {
      const selectedDestination = location.state.selectedDestination;
      setPlace(selectedDestination);
      handleInputChange("location", selectedDestination);
    }
  }, [location.state]);

  // ---------------- GOOGLE LOGIN ----------------
  const login = useGoogleLogin({
    onSuccess: (tokenResp) => getUserProfile(tokenResp),
    onError: () => toast.error("Google login failed"),
  });

  const getUserProfile = (tokenInfo) => {
    axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
        headers: { Authorization: `Bearer ${tokenInfo.access_token}` },
      })
      .then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        window.dispatchEvent(new Event("user-updated"));
        toast.success("Login successful");
        setOpenDialog(false);

        if (pendingGenerateAfterLogin) {
          setPendingGenerateAfterLogin(false);
          OnGenerateTrip();
        }
      })
      .catch(() => toast.error("Failed to fetch user profile"));
  };

  // ---------------- SAVE TRIP ----------------
  const SaveAiTrip = async (tripJson) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw new Error("Please login first");
    }

    const user = JSON.parse(userStr);
    const docId = Date.now().toString();

    await setDoc(doc(db, "AITrips", docId), {
      id: docId,
      userEmail: user.email,
      userSelection: formData,
      tripData: tripJson,
      createdAt: new Date(),
    });

    console.log("Trip saved in Firestore:", tripJson);

    // Navigate to view page
    navigate(`/view-trip/${docId}`);
  };

  // ---------------- GENERATE TRIP ----------------
  const OnGenerateTrip = async () => {
    if (loading) return;
    let toastId;

    if (!localStorage.getItem("user")) {
      setPendingGenerateAfterLogin(true);
      setOpenDialog(true);
      toast.error("Please sign in to generate a trip");
      return;
    }
    if (pendingGenerateAfterLogin) {
      setPendingGenerateAfterLogin(false);
    }

    if (!formData.location || !formData.noOfDays || !formData.budget || !formData.traveler || !formData.country) {
      toast.error("Please fill all details including country");
      return;
    }

    const locationLabel = getLocationLabel(formData.location).trim();
    if (!locationLabel) {
      toast.error("Please choose a valid destination");
      return;
    }

    if (!import.meta.env.VITE_GOOGLE_GEMINI_API_KEY) {
      toast.error("Missing Gemini API key in .env.local");
      return;
    }

    setLoading(true);
    toastId = toast.loading("Generating your trip plan...");

    try {
      const FINAL_PROMPT = AI_PROMPT
        .replace("{location}", locationLabel)
        .replace("{country}", formData.country)
        .replace("{totalDays}", String(formData.noOfDays))
        .replace("{traveler}", formData.traveler)
        .replace("{budget}", formData.budget);

      const tripText = await generateTripPlan(FINAL_PROMPT);
      if (!tripText) {
        throw new Error("Empty AI response");
      }

      console.log("🤖 RAW AI RESPONSE:", tripText);

      // ✅ Convert AI string → JSON
      let tripJson = cleanAndParseJSON(tripText);
      if (!hasRealisticTicketPrices(tripJson)) {
        const ticketRetryPrompt = `${FINAL_PROMPT}

CRITICAL:
- Every activity.ticket must have a numeric amount/range in local currency (or exactly Free).
- Never use "included", "package", "extra", "varies", "N/A", or blank values.`;
        const retryTripText = await generateTripPlan(ticketRetryPrompt);
        if (retryTripText) {
          const retryTripJson = cleanAndParseJSON(retryTripText);
          if (hasRealisticTicketPrices(retryTripJson)) {
            tripJson = retryTripJson;
          }
        }
      }

      console.log("✅ PARSED AI JSON:", tripJson);

      // Save JSON to Firestore
      await SaveAiTrip(tripJson);

      try {
        await trendingService.trackSearch(locationLabel);
      } catch (trackingError) {
        console.error("Trending tracking failed:", trackingError);
      }

      toast.success("Trip generated & saved 🎉", { id: toastId });

    } catch (error) {
      console.error("🚨 TRIP ERROR:", error);
      toast.error(error?.message || "Failed to generate trip", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 px-5 text-[color:var(--color-text)] sm:px-10 md:px-32 lg:px-56 xl:px-10">
      <h2 className="font-bold text-3xl">Tell us your travel preferences 🏕️🌴</h2>
      <p className="mt-3 text-xl text-[color:var(--color-muted)]">
        Just provide some basic information, and our trip planner will generate a customized itinerary.
      </p>

      <TrendingDestinations
        onSelectDestination={(selectedPlace) => {
          setPlace(selectedPlace);
          handleInputChange("location", selectedPlace);
        }}
      />

      <div className="mt-20 flex flex-col gap-9">

        {/* DESTINATION */}
        <div>
          <h2 className="text-xl my-3 font-medium">What is destination of choice?</h2>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              value: place,
              onChange: (v) => {
                setPlace(v);
                handleInputChange("location", v);
              },
              closeMenuOnSelect: true,
              blurInputOnSelect: true,
              menuShouldBlockScroll: false,
              menuPosition: "fixed",
              menuPortalTarget: typeof window !== "undefined" ? window.document.body : undefined,
              styles: {
                control: (base, state) => ({
                  ...base,
                  backgroundColor: 'var(--color-surface)',
                  borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : 'none',
                  '&:hover': {
                    borderColor: 'var(--color-primary)',
                  },
                  minHeight: '40px',
                }),
                input: (base) => ({
                  ...base,
                  color: 'var(--color-text)',
                  fontSize: '14px',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'var(--color-muted)',
                  fontSize: '14px',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'var(--color-text)',
                  fontSize: '14px',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 40,
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 40,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? 'var(--color-primary)'
                    : state.isFocused
                    ? 'var(--color-surface-hover)'
                    : 'var(--color-surface)',
                  color: state.isSelected ? 'white' : 'var(--color-text)',
                  cursor: 'pointer',
                  '&:active': {
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  },
                }),
              },
            }}
          />
        </div>

        {/* COUNTRY */}
        <div>
          <h2 className="text-xl my-3 font-medium">Which country are you traveling to?</h2>
          <select
            value={formData.country || ""}
            onChange={(e) => handleInputChange("country", e.target.value)}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 text-[color:var(--color-text)]"
          >
            <option value="">Select a country</option>
            <option value="india">India</option>
            <option value="thailand">Thailand</option>
            <option value="japan">Japan</option>
            <option value="usa">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="france">France</option>
            <option value="germany">Germany</option>
            <option value="italy">Italy</option>
            <option value="spain">Spain</option>
            <option value="australia">Australia</option>
            <option value="canada">Canada</option>
            <option value="switzerland">Switzerland</option>
            <option value="netherlands">Netherlands</option>
            <option value="singapore">Singapore</option>
            <option value="uae">United Arab Emirates</option>
            <option value="brazil">Brazil</option>
            <option value="mexico">Mexico</option>
            <option value="south-korea">South Korea</option>
            <option value="vietnam">Vietnam</option>
            <option value="indonesia">Indonesia</option>
            <option value="malaysia">Malaysia</option>
            <option value="philippines">Philippines</option>
            <option value="turkey">Turkey</option>
            <option value="egypt">Egypt</option>
            <option value="morocco">Morocco</option>
            <option value="south-africa">South Africa</option>
            <option value="argentina">Argentina</option>
            <option value="chile">Chile</option>
            <option value="peru">Peru</option>
            <option value="new-zealand">New Zealand</option>
            <option value="iceland">Iceland</option>
            <option value="norway">Norway</option>
            <option value="sweden">Sweden</option>
            <option value="denmark">Denmark</option>
            <option value="finland">Finland</option>
            <option value="portugal">Portugal</option>
            <option value="greece">Greece</option>
            <option value="croatia">Croatia</option>
            <option value="czech-republic">Czech Republic</option>
            <option value="hungary">Hungary</option>
            <option value="poland">Poland</option>
            <option value="austria">Austria</option>
            <option value="belgium">Belgium</option>
            <option value="ireland">Ireland</option>
            <option value="scotland">Scotland</option>
            <option value="wales">Wales</option>
          </select>
        </div>

        {/* DAYS */}
        <div>
          <h2 className="text-xl my-3 font-medium">How many days are you planning your trip?</h2>
          <input
            type="number"
            placeholder="Ex. 3"
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2"
            onChange={(e) =>
              handleInputChange("noOfDays", Math.max(1, Number(e.target.value)))
            }
          />
        </div>

        {/* BUDGET */}
        <div>
          <h2 className="text-xl my-3 font-medium">What is your budget?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("budget", item.title)}
                className={`cursor-pointer rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-shadow hover:shadow-lg
                  ${formData?.budget === item.title ? "border-[color:var(--color-text)] shadow-lg" : ""}`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-[color:var(--color-muted)]">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* TRAVELERS */}
        <div>
          <h2 className="text-xl my-3 font-medium">You plan to travel with?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {SelectTravelList.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("traveler", item.people)}
                className={`cursor-pointer rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 transition-shadow hover:shadow-lg
                  ${formData?.traveler === item.people ? "border-[color:var(--color-text)] shadow-lg" : ""}`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <h2 className="text-sm text-[color:var(--color-muted)]">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GENERATE BUTTON - FIXED POSITION */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          disabled={loading}
          onClick={OnGenerateTrip}
          className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-700 transition-all hover:shadow-xl"
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="h-6 w-7 animate-spin" />
          ) : (
            "Generate Trip"
          )}
        </button>
      </div>

      {/* LOGIN DIALOG */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="h-screen w-screen max-w-none rounded-none bg-[color:var(--color-surface)] p-6 text-[color:var(--color-text)]">
          <DialogHeader>
            <DialogTitle className="sr-only">Google Sign In</DialogTitle>
            <DialogDescription>
              Sign in to the app using Google authentication
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center h-full text-center">
            <img src="/logo.svg" alt="AI Trip Planner Logo" className="logo-text" />

            <h2 className="font-bold text-2xl mt-7">Sign in With Google</h2>

            <p className="text-sm text-muted-foreground mt-2">
              Securely authenticate using your Google account
            </p>

            <Button
              onClick={login}
              className="mt-6 flex w-full max-w-sm items-center gap-4 bg-[color:var(--color-text)] text-[color:var(--color-bg)] hover:opacity-90"
            >
              <FcGoogle className="h-7 w-7" />
              Sign in With Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
