"use client";

import { useState, useEffect } from "react";
import AddressVerifier from "@/components/Verifier";
import GoogleMapsComponent from "@/components/Source";
import LogsDisplay from "@/components/LogsDisplay";
import { saveActiveTab, getActiveTab } from "@/lib/elasticsearch";
import { FileClock, MapPin, MapPinCheck, Search } from "lucide-react";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("addressVerifier");
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering and load persisted tab
  useEffect(() => {
    setIsClient(true);
    const savedTab = getActiveTab();
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab whenever it changes
  useEffect(() => {
    if (isClient) {
      saveActiveTab(activeTab);
    }
  }, [activeTab, isClient]);

  if (!isClient) {
    return (
      <div className="w-full">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <div className="whitespace-nowrap py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm flex items-center gap-2">
              <MapPin size={20} />
              Address Verifier
            </div>
            <div className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm flex items-center gap-2">
              <Search size={20} />
              Location Search
            </div>
            <div className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm flex items-center gap-2">
              <FileClock size={19} />
              Activity Logs
            </div>
          </nav>
        </div>
        <div className="mt-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div>
        <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("addressVerifier")}
            className={`${
              activeTab === "addressVerifier"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <MapPin size={20} />
            Address Verifier
          </button>
          <button
            onClick={() => setActiveTab("locationSearch")}
            className={`${
              activeTab === "locationSearch"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <Search size={20} />
            Location Search
          </button>
          <button
            onClick={() => setActiveTab("activityLogs")}
            className={`${
              activeTab === "activityLogs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <FileClock size={19} />
            Activity Logs
          </button>
        </nav>
      </div>
      <div className="min-h-[600px]">
        {activeTab === "addressVerifier" && <AddressVerifier />}
        {activeTab === "locationSearch" && <GoogleMapsComponent />}
        {activeTab === "activityLogs" && <LogsDisplay />}
      </div>
    </div>
  );
};

export default Tabs;
