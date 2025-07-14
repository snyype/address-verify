import type React from "react";
import Tabs from "@/components/Tabs";
import { MapPin, Shield, Zap, Globe, CheckCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8">
        {/* Hero Section */}
        <div className="">
          <div className="text-center">
            <div className="flex flex-col md:flex-row items-center justify-center min-h-20">
              <Image
                src="/logo.png"
                alt="Address Cerifier"
                className="w-12 lg:w-16"
                width={100}
                height={100}
              />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand">
                Address Validator
              </h2>
            </div>
            <p className="text-gray-700 max-w-2xl text-base lg:text-lg mx-auto">
              Validate and Search Australian addresses instantly
            </p>
          </div>

          <Tabs />
        </div>

        <div className="text-center py-8 border-t border-white/20">
          <p className="text-gray-500 text-sm">
            Powered by GraphQL • Google Maps API • Minimally Built with 💙 By{" "}
            <a href="https://github.com/snyype" className="text-blue-600">
              Aashish
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
