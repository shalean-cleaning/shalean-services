'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface DataSummary {
  [tableName: string]: number;
}

interface DataResults {
  [tableName: string]: any[] | { error: string };
}

interface LoadDataResponse {
  success: boolean;
  connection: string;
  timestamp: string;
  summary: DataSummary;
  data: DataResults;
}

export function DataLoader() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LoadDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/load-data');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load data');
      }
      
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  const getStatusIcon = (tableName: string) => {
    if (!data) return null;
    
    const tableData = data.data[tableName];
    if (Array.isArray(tableData)) {
      return tableData.length > 0 ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-yellow-500" />
      );
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Data Loader
          </CardTitle>
          <CardDescription>
            Load and display all data from your Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Data...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Load Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                Data loaded at {new Date(data.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(data.summary).map(([tableName, count]) => (
                  <div key={tableName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tableName)}
                      <span className="font-medium text-sm">{tableName}</span>
                    </div>
                    <Badge variant={count > 0 ? "default" : "secondary"}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Data */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Data</CardTitle>
              <CardDescription>
                View the actual data from each table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(data.data)[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Object.keys(data.data).map((tableName) => (
                    <TabsTrigger key={tableName} value={tableName} className="text-xs">
                      {tableName}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(data.data).map(([tableName, tableData]) => (
                  <TabsContent key={tableName} value={tableName} className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{tableName}</CardTitle>
                        <CardDescription>
                          {Array.isArray(tableData) 
                            ? `${tableData.length} records` 
                            : 'Error loading data'
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {Array.isArray(tableData) ? (
                          <div className="space-y-4">
                            {tableData.length === 0 ? (
                              <p className="text-muted-foreground">No data found</p>
                            ) : (
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {tableData.map((record, index) => (
                                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                    <h4 className="font-medium mb-2">Record {index + 1}</h4>
                                    <pre className="text-xs overflow-x-auto">
                                      {JSON.stringify(record, null, 2)}
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                            <p className="text-red-700 font-medium">Error:</p>
                            <p className="text-red-600 text-sm">{tableData.error}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
