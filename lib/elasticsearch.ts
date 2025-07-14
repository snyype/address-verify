"use client"

import { useMutation, useQuery } from "@apollo/client"
import { LOG_ACTIVITY, GET_LOGS } from "./graphqlmutation"

const getSessionId = (): string => {
  if (typeof window !== "undefined") {
    let sessionId = sessionStorage.getItem("sessionId")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("sessionId", sessionId)
    }
    return sessionId
  }
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const useActivityLogger = () => {
  const [logActivity] = useMutation(LOG_ACTIVITY)

  const logVerification = async (
    input: { postcode: string; suburb: string; state: string },
    output: any,
    success: boolean,
  ) => {
    try {
      await logActivity({
        variables: {
          input: {
            type: "VERIFY",
            input: JSON.stringify(input),
            output: JSON.stringify(output),
            success,
            sessionId: getSessionId(),
            userId: getUserId(),
          },
        },
      })
    } catch (error) {
      console.error("Failed to log verification activity:", error)
    }
  }

  const logSearch = async (
    input: { query: string; categories?: string[]; selectedLocation?: string },
    output: any,
    success: boolean,
  ) => {
    try {
      await logActivity({
        variables: {
          input: {
            type: "SEARCH",
            input: JSON.stringify(input),
            output: JSON.stringify(output),
            success,
            sessionId: getSessionId(),
            userId: getUserId(),
          },
        },
      })
    } catch (error) {
      console.error("Failed to log search activity:", error)
    }
  }

  return { logVerification, logSearch }
}

export const useLogs = (limit = 50, type?: string) => {
  const { data, loading, error, refetch } = useQuery(GET_LOGS, {
    variables: {
      limit,
      offset: 0,
      type,
    },
    fetchPolicy: "cache-and-network",
  })

  return {
    logs: data?.getLogs || [],
    loading,
    error,
    refetch,
  }
}

export const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }
}

export const getFromLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error("Failed to get from localStorage:", error)
      return defaultValue
    }
  }
  return defaultValue
}

export const saveVerifierData = (data: {
  postcode: string
  suburb: string
  state: string
  result?: any
}) => {
  saveToLocalStorage("verifierData", data)
}

export const getVerifierData = () => {
  return getFromLocalStorage("verifierData", {
    postcode: "",
    suburb: "",
    state: "",
    result: null,
  })
}

export const saveSourceData = (data: {
  query: string
  categories: string[]
  results: any[]
  selectedLocation?: any
}) => {
  saveToLocalStorage("sourceData", data)
}

export const getSourceData = () => {
  return getFromLocalStorage("sourceData", {
    query: "",
    categories: [],
    results: [],
    selectedLocation: null,
  })
}

export const saveActiveTab = (tab: string) => {
  saveToLocalStorage("activeTab", tab)
}

export const getActiveTab = () => {
  return getFromLocalStorage("activeTab", "addressVerifier")
}

const getUserId = (): string | undefined => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId") || undefined
  }
  return undefined
}

export { getSessionId }
