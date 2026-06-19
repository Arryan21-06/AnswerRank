"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("creator" | "brand" | "admin")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");

      if (!accessToken || !userStr) {
        // Not logged in
        router.replace(`/login?return_to=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          // Logged in but wrong role
          if (user.role === "creator") {
             router.replace("/creator");
          } else if (user.role === "brand") {
             router.replace("/brand");
          } else {
             router.replace("/");
          }
          return;
        }

        // All good
        setIsAuthorized(true);
      } catch {
         // Bad user data in local storage
         localStorage.removeItem("access_token");
         localStorage.removeItem("refresh_token");
         localStorage.removeItem("user");
         router.replace(`/login?return_to=${encodeURIComponent(pathname)}`);
      }
    };

    checkAuth();
  }, [router, pathname, allowedRoles]);

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
