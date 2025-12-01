import { useState } from "react";
import { Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function ManualPlannerMode() {
  const [topics, setTopics] = useState<string[]>([""]);
  const [examDate, setExamDate] = useState<string>("");
  const [hoursPerDay, setHoursPerDay] = useState<string>("2");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addTopic = () => {
    setTopics([...topics, ""]);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleSubmit = async () => {
    const validTopics = topics.filter(t => t.trim());
    
    if (validTopics.length === 0 || !examDate || !hoursPerDay) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to generate your schedule.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Schedule generated!",
        description: "Your personalized study plan is ready.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base">Study Topics</Label>
        {topics.map((topic, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Topic ${index + 1} (e.g., Linear Algebra)`}
              value={topic}
              onChange={(e) => updateTopic(index, e.target.value)}
              className="flex-1"
            />
            {topics.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeTopic(index)}
                className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addTopic}
          className="w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Topic
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exam-date" className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Exam Date
          </Label>
          <Input
            id="exam-date"
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hours-per-day" className="text-base">
            Hours Per Day
          </Label>
          <Input
            id="hours-per-day"
            type="number"
            min="1"
            max="24"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Schedule...
          </>
        ) : (
          "Generate Schedule"
        )}
      </Button>
    </div>
  );
}
