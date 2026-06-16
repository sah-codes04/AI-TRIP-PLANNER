import React from "react";

const getStoredUser = () => {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.error("Failed to parse user profile:", error);
    return null;
  }
};

function Profile() {
  const user = getStoredUser();

  return (
    <div className="mx-auto mt-10 max-w-3xl px-5 text-[color:var(--color-text)] sm:px-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      {user ? (
        <div className="mt-6 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {user.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-surface-hover)] text-xl font-bold">
                {user?.given_name?.[0] || user?.name?.[0] || "U"}
              </div>
            )}

            <div>
              <p className="text-xl font-semibold">{user.name || "User"}</p>
              <p className="text-[color:var(--color-muted)]">{user.email}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-[color:var(--color-muted)]">
          Sign in to view your profile details.
        </p>
      )}
    </div>
  );
}

export default Profile;
