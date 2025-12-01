import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Edit3 } from "lucide-react";
import { PdfUploadMode } from "./PdfUploadMode";
import { ManualPlannerMode } from "./ManualPlannerMode";

export function ModeToggle() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 -mt-12 relative z-10">
      <Tabs defaultValue="pdf" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card shadow-lg border border-border h-14">
          <TabsTrigger 
            value="pdf" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-base gap-2"
          >
            <FileText className="h-5 w-5" />
            Upload PDF
          </TabsTrigger>
          <TabsTrigger 
            value="manual"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all text-base gap-2"
          >
            <Edit3 className="h-5 w-5" />
            Manual Entry
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-8 bg-card rounded-xl shadow-lg border border-border p-8">
          <TabsContent value="pdf" className="m-0">
            <PdfUploadMode />
          </TabsContent>
          
          <TabsContent value="manual" className="m-0">
            <ManualPlannerMode />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
