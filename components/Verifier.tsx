"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { VALIDATE_ADDRESS } from "@/lib/graphqlmutation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle, XCircle, Loader2, Search, LocateFixed } from "lucide-react";
import GoogleMapComponent from "./GoogleMap";
import {
  saveVerifierData,
  getVerifierData,
  useActivityLogger,
} from "@/lib/elasticsearch";

interface FormData {
  postcode: string;
  suburb: string;
  state: string;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  confidence?: number;
  location?: {
    lat: number;
    lng: number;
    title: string;
    address: string;
  };
}

const AddressVerifier = () => {
  const [formData, setFormData] = useState<FormData>({
    postcode: "",
    suburb: "",
    state: "",
  });
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [validateAddress, { loading }] = useMutation(VALIDATE_ADDRESS);
  const { logVerification } = useActivityLogger();

  useEffect(() => {
    setIsClient(true);
    const savedData = getVerifierData();
    if (savedData) {
      setFormData({
        postcode: savedData.postcode || "",
        suburb: savedData.suburb || "",
        state: savedData.state || "",
      });
      if (savedData.result) {
        setResult(savedData.result);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      saveVerifierData({ ...formData, result });
    }
  }, [formData, result, isClient]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (result) {
      setResult(null);
    }
  };

  const isFormValid = Boolean(
    formData.postcode?.trim() &&
      formData.suburb?.trim() &&
      formData.state?.trim()
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!isFormValid) {
      return;
    }

    try {
      const response = await validateAddress({
        variables: {
          postcode: formData.postcode,
          suburb: formData.suburb,
          state: formData.state,
        },
      });

      const message = response?.data?.validateAddress || "Unexpected response.";
      console.log(response);
      const isValid =
        message.toLowerCase().includes("valid") ||
        message.toLowerCase().includes("valid");

      const location = isValid
        ? {
            lat: -33.8688 + (Math.random() - 0.5) * 0.1,
            lng: 151.2093 + (Math.random() - 0.5) * 0.1,
            title: `${formData.suburb}, ${formData.state} ${formData.postcode}`,
            address: `${formData.suburb}, ${formData.state} ${formData.postcode}, Australia`,
          }
        : undefined;

      const validationResult = {
        isValid,
        message,
        confidence: isValid ? 95 : 0,
        location,
      };

      setResult(validationResult);

      await logVerification(
        {
          postcode: formData.postcode,
          suburb: formData.suburb,
          state: formData.state,
        },
        validationResult,
        isValid
      );
    } catch (err) {
      console.error(err);
      const errorResult = {
        isValid: false,
        message: "Failed to validate address. Please try again.",
        confidence: 0,
      };
      setResult(errorResult);

      await logVerification(
        {
          postcode: formData.postcode,
          suburb: formData.suburb,
          state: formData.state,
        },
        errorResult,
        false
      );
    }
  };

  const getFieldError = (field: keyof FormData) => {
    return hasSubmitted && !formData[field];
  };

  if (!isClient) {
    return (
      <div className="py-8 px-4">
        <div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Address Verifier
            </h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="">
              <CardTitle className="text-xl">Enter Address Details</CardTitle>
              <CardDescription>
                Fill in all fields to verify your Australian address
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postcode" className="text-sm font-medium">
                      Postcode *
                    </Label>
                    <Input
                      id="postcode"
                      value={formData.postcode || ""}
                      onChange={(e) =>
                        updateFormData("postcode", e.target.value)
                      }
                      placeholder="2000"
                      className={`transition-colors ${
                        getFieldError("postcode")
                          ? "border-red-300 focus:border-red-500"
                          : "focus:border-blue-500"
                      }`}
                      maxLength={4}
                    />
                    {getFieldError("postcode") && (
                      <p className="text-xs text-red-600">
                        Postcode is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suburb" className="text-sm font-medium">
                      Suburb *
                    </Label>
                    <Input
                      id="suburb"
                      value={formData.suburb || ""}
                      onChange={(e) => updateFormData("suburb", e.target.value)}
                      placeholder="Bondi"
                      className={`transition-colors ${
                        getFieldError("suburb")
                          ? "border-red-300 focus:border-red-500"
                          : "focus:border-blue-500"
                      }`}
                    />
                    {getFieldError("suburb") && (
                      <p className="text-xs text-red-600">Suburb is required</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="state" className="text-sm font-medium">
                    State *
                  </Label>
                  <Select
                    value={formData.state || ""}
                    onValueChange={(value) => updateFormData("state", value)}
                  >
                    <SelectTrigger
                      id="state"
                      className={`w-full transition-colors ${
                        getFieldError("state")
                          ? "border-red-300 focus:border-red-500"
                          : "focus:border-blue-500"
                      }`}
                    >
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NSW">New South Wales (NSW)</SelectItem>
                      <SelectItem value="VIC">Victoria (VIC)</SelectItem>
                      <SelectItem value="QLD">Queensland (QLD)</SelectItem>
                      <SelectItem value="WA">Western Australia (WA)</SelectItem>
                      <SelectItem value="SA">South Australia (SA)</SelectItem>
                      <SelectItem value="TAS">Tasmania (TAS)</SelectItem>
                      <SelectItem value="NT">
                        Northern Territory (NT)
                      </SelectItem>
                      <SelectItem value="ACT">
                        Australian Capital Territory (ACT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError("state") && (
                    <p className="text-xs text-red-600">State is required</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating Address...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Validate Address
                    </>
                  )}
                </Button>
              </form>

              {result && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Alert
                    className={`${
                      result.isValid
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {result.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex flex-col gap-y-2">
                        <h3
                          className={`font-semibold ${
                            result.isValid ? "text-green-800" : "text-red-800"
                          }`}
                        >
                          {result.isValid ? "Address Valid" : "Address Invalid"}
                        </h3>
                        <AlertDescription
                          className={`${
                            result.isValid ? "text-green-700" : "text-red-700"
                          } alert-description `}
                        >
                          {result.message}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  This service validates Australian addresses only
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Location Map</CardTitle>
              <CardDescription>
                {result?.location
                  ? "Verified address location"
                  : "Map will show location after validation"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result?.location ? (
                <GoogleMapComponent
                  locations={[result.location]}
                  center={{
                    lat: result.location.lat,
                    lng: result.location.lng,
                  }}
                  zoom={15}
                  height="400px"
                  className="rounded-lg"
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Enter and validate an address to see its location
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddressVerifier;
