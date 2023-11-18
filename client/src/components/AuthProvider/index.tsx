'use client';
import apiClient from "@/lib/api";
import useAuthUser from "@/lib/stores/use-auth";
import { ReactNode, useEffect } from "react";


export default function AuthProvider({ children }: { children?: ReactNode }) {
    const { authUser, setAuthUser } = useAuthUser()


    useEffect(() => {
        apiClient.user.getProfile().then((res) => {
            if (res.succeed && res.data) setAuthUser(res.data)
        })
    }, [setAuthUser])

    return (
        <>
            {authUser && children}
        </>
    )
}

