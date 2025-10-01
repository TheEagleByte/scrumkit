"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBulkImportStories } from "@/hooks/use-poker-stories";
import { parseCSVStories, generateCSVTemplate } from "@/lib/poker/csv-import";
import { FileUp, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface BulkImportDialogProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkImportDialog({
  sessionId,
  open,
  onOpenChange,
  onSuccess,
}: BulkImportDialogProps) {
  const [csvText, setCsvText] = useState("");
  const [parsedData, setParsedData] = useState<ReturnType<typeof parseCSVStories> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkImport = useBulkImportStories();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setParsedData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
    };
    reader.onerror = () => {
      console.error("Error reading CSV file");
      setParsedData(null);
    };
    reader.readAsText(file);
  };

  const handleParse = () => {
    setIsProcessing(true);
    try {
      const result = parseCSVStories(csvText);
      setParsedData(result);
    } catch (error) {
      console.error("Error parsing CSV:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.stories.length === 0) return;

    setIsProcessing(true);
    try {
      await bulkImport.mutateAsync({
        sessionId,
        stories: parsedData.stories,
      });
      onSuccess?.();
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error importing stories:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCsvText("");
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "story-import-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Stories</DialogTitle>
          <DialogDescription>
            Import multiple stories at once from a CSV file or paste CSV text directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Paste CSV</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">CSV Content</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              <Textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  setParsedData(null);
                }}
                placeholder={`Paste your CSV content here...

Example:
title,description,acceptance_criteria,external_link
"User Login","Implement authentication","Users can login","https://example.com"`}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Upload CSV File</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-file-upload"
                />
                <label htmlFor="csv-file-upload">
                  <Button variant="outline" asChild>
                    <span>Select CSV File</span>
                  </Button>
                </label>
                <p className="text-sm text-muted-foreground mt-2">
                  or drag and drop a CSV file here
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Parse Button */}
        {csvText && !parsedData && (
          <Button onClick={handleParse} disabled={isProcessing} className="w-full">
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Parse CSV
          </Button>
        )}

        {/* Preview Section */}
        {parsedData && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {parsedData.errors.length === 0 ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Ready to import</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Parsed with warnings</span>
                  </>
                )}
              </div>
              <div className="flex gap-4">
                <Badge variant="secondary">
                  {parsedData.stories.length} stories
                </Badge>
                {parsedData.errors.length > 0 && (
                  <Badge variant="destructive">
                    {parsedData.errors.length} errors
                  </Badge>
                )}
              </div>
            </div>

            {/* Errors */}
            {parsedData.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Import Errors:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {parsedData.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview Stories */}
            {parsedData.stories.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Preview ({parsedData.stories.length} stories)</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-4">
                  {parsedData.stories.map((story, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded border"
                    >
                      <div className="font-medium">{story.title}</div>
                      {story.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {story.description}
                        </p>
                      )}
                      {story.external_link && (
                        <a
                          href={story.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                        >
                          {story.external_link}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          {parsedData && (
            <>
              <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                Reset
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing || parsedData.stories.length === 0}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import {parsedData.stories.length} Stories
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
