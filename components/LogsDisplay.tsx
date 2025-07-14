"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useLogs } from "@/lib/elasticsearch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  MapPin,
} from "lucide-react";
import JsonViewer from "@/components/ui/json-viewer";

interface LogEntry {
  id: string;
  type: "VERIFY" | "SEARCH";
  input: any;
  output: any;
  success: boolean;
  timestamp: string;
  sessionId?: string;
  userId?: string;
}

const LogsDisplay: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isClient, setIsClient] = useState(false);
  const { logs, loading, error, refetch } = useLogs(
    50,
    selectedType === "all" ? undefined : selectedType
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRefresh = () => {
    refetch();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getTypeIcon = (type: string) => {
    return type === "VERIFY" ? (
      <MapPin className="h-4 w-4" />
    ) : (
      <Search className="h-4 w-4" />
    );
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "verify":
        return "bg-blue-100 text-blue-800";
      case "search":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isClient) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
        <div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Activity Logs
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
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col gap-y-3 md:flex-row items-center justify-center text-center md:text-left md:justify-between">
              <div>
                <CardTitle className="text-xl">Application Logs</CardTitle>
                <CardDescription>
                  Track verification and search activities
                </CardDescription>
              </div>
              <div className="flex md:flex-row items-center space-x-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="VERIFY">Verification</SelectItem>
                    <SelectItem value="SEARCH">Search</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleRefresh}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">
                    Failed to load logs: {error.message}
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-3 text-purple-600" />
                <span className="text-sm text-gray-600">Loading logs...</span>
              </div>
            )}

            {/* Empty State */}
            {!loading && logs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No logs found</p>
                <p className="text-sm text-gray-400">
                  Use the application to generate activity logs
                </p>
              </div>
            )}

            {/* Logs List */}
            {!loading && logs.length > 0 && (
              <div className="space-y-4">
                {logs.map((log: LogEntry) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(log.success)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-3">
                            <div className="flex items-center space-x-1 mb-1 sm:mb-0">
                              {getTypeIcon(log.type)}
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                  log.type
                                )}`}
                              >
                                {log.type}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Input:
                              </h4>
                              <JsonViewer data={log.input} maxHeight="200px" />
                            </div>

                            {log.output && (
                              <div className="min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Output:
                                </h4>
                                <JsonViewer data={log.output} maxHeight="200px" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-left lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 lg:ml-4">
                        {log.sessionId && (
                          <div className="text-xs text-gray-500 mb-1">
                            Session: {log.sessionId.slice(-8)}
                          </div>
                        )}
                        {log.userId && (
                          <div className="text-xs text-gray-500">
                            User: {log.userId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LogsDisplay;
