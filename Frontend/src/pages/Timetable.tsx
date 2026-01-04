import { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Loader2, ListTodo, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { aiAgentFetch, authenticatedFetch } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useTimetableStore } from '@/store/timetableStore'; // Import the new timetable store
import { Checkbox } from '@/components/ui/checkbox';

interface TimetableTask {
  id: string;
  description: string;
  hours: number;
  completed: boolean;
}

interface TimetableData {
  [day: string]: TimetableTask[];
}

export default function Timetable() {
  const { user } = useAuthStore();
  const { currentTimetable, setTimetable } = useTimetableStore(); // Use global timetable store
  const [textInput, setTextInput] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [availability, setAvailability] = useState('');
  const [startDate, setStartDate] = useState('');
  const [studyTime, setStudyTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [timetableId, setTimetableId] = useState<string | null>(null); // New state for timetable ID
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        toast.success(`PDF selected: ${file.name}`);
      } else {
        toast.error("Please upload a PDF file.");
        setPdfFile(null);
      }
    }
  };

  const handleTaskCompletion = async (day: string, taskId: string, isCompleted: boolean) => {
    // Optimistically update the UI
    setTimetable(prevTimetable => {
      if (!prevTimetable) return null;
      const newTimetable = { ...prevTimetable };
      if (newTimetable[day]) {
        newTimetable[day] = newTimetable[day].map(task =>
          task.id === taskId ? { ...task, completed: isCompleted } : task
        );
      }
      return newTimetable;
    });
    toast.info(`Task on ${day} marked as ${isCompleted ? 'completed' : 'incomplete'}.`);

    if (!isCompleted) {
      // If a task is marked as incomplete, trigger re-alignment
      if (!user?.uid) {
        toast.error("User not authenticated for re-alignment.");
        return;
      }
      if (!currentTimetable) { // Use currentTimetable from store
        toast.error("No timetable to re-align.");
        return;
      }
      if (!timetableId) { // Ensure we have a timetable ID for updating
        toast.error("No active timetable found for re-alignment. Please generate one first.");
        return;
      }

      setLoading(true);
      try {
        // 1. Call AI agent to get a realigned schedule
        const aiAgentResponse = await aiAgentFetch('/schedule/realign', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.uid,
            currentTimetable: currentTimetable, // Send the current state of the timetable
            missedTaskId: taskId,
            availability: availability,
            studyTime: studyTime,
          }),
        });

        const realignedTimetableData = aiAgentResponse.newTimetable; // AI agent returns 'newTimetable'

        // 2. Update the timetable in Firestore via the backend
        await authenticatedFetch(`/timetables/${timetableId}`, {
          method: 'PUT',
          body: JSON.stringify({
            userId: user.uid,
            timetableData: realignedTimetableData,
            availability: availability,
            startDate: startDate,
            studyTime: studyTime,
          }),
        });

        // 3. Update the frontend store with the realigned schedule
        setTimetable(realignedTimetableData);
        toast.success("Timetable re-aligned and saved successfully!");
      } catch (error) {
        console.error("Error re-aligning timetable:", error);
        toast.error("Failed to re-align timetable.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      toast.error("Please log in to generate a timetable.");
      return;
    }
    if (!textInput && !pdfFile) {
      toast.error("Please provide text input or upload a syllabus PDF.");
      return;
    }
    if (!availability || !startDate || !studyTime) {
      toast.error("Please fill in all timetable details: availability, start date, and study time.");
      return;
    }

    setLoading(true);

    let response;

    try {
      if (pdfFile) {
        const reader = new FileReader();
        reader.readAsDataURL(pdfFile);
        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            const base64Pdf = (reader.result as string).split(',')[1]; // Get base64 content
            const formData = new FormData();
            formData.append('syllabusPdf', pdfFile);
            formData.append('userId', user.uid);
            formData.append('availability', availability);
            formData.append('startDate', startDate);
            formData.append('studyTime', studyTime);

            try {
              // Use authenticatedFetch to send FormData to the backend
              // The backend will then forward the base64 content to the AI agent
              response = await authenticatedFetch('/upload-syllabus-pdf', {
                method: 'POST',
                body: formData, // No JSON.stringify for FormData
                // Let the browser set Content-Type for FormData
                headers: {},
              });
              setTimetableId(response.timetableId); // Set timetable ID
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = error => reject(error);
        });
      } else if (textInput) {
        // If only text input, send it to the backend for AI generation and Firestore saving
        response = await authenticatedFetch('/timetables/generate-text', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.uid,
            rawData: textInput,
            availability,
            startDate,
            studyTime,
          }),
        });
        setTimetableId(response.timetableId); // Set timetable ID
      }

      if (!response) {
        throw new Error("No response from timetable generation.");
      }

      // Transform AI agent response into TimetableData structure
      const newTimetable: TimetableData = {};
      Object.entries(response.timetable).forEach(([dayKey, dayValue]) => {
        // Skip metadata fields that are not part of the actual schedule
        if (['notes', 'raw_input_content_length', 'topics_considered'].includes(dayKey)) {
          return; // Skip this entry
        }

        if (typeof dayValue === 'string') {
          // This case should ideally not happen if AI agent returns structured tasks
          const description = dayValue; // Use full string as description
          const hours = 0; // Default hours if not specified
          newTimetable[dayKey] = [{
            id: `${dayKey}-${description.replace(/\s/g, '-')}`,
            description,
            hours,
            completed: false,
          }];
        } else if (Array.isArray(dayValue)) {
          // Handle if AI agent returns an array of tasks for a day
          newTimetable[dayKey] = dayValue.map((task: any) => ({
            id: task.id || `${dayKey}-${(task.description || '').replace(/\s/g, '-')}`,
            description: task.description || '',
            hours: task.hours,
            completed: false,
          }));
        }
      });
      setTimetable(newTimetable); // Update global timetable state
      toast.success("Timetable generated successfully!");
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast.error("Failed to generate timetable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20 md:pb-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary">Study Timetable</h1>
          <p className="text-muted-foreground mt-2">Plan and organize your study sessions with AI assistance</p>
        </div>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              Generate Your Study Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="text-input">Course Description / Topics</Label>
                <Textarea
                  id="text-input"
                  placeholder="e.g., 'Data Structures and Algorithms: Arrays, Linked Lists, Trees...' or copy-paste from your syllabus."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">Provide key course content or topics.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Upload Syllabus PDF</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="h-11 file:text-primary file:font-semibold file:bg-primary/10 file:border-none hover:file:bg-primary/20 file:mr-4"
                />
                <p className="text-sm text-muted-foreground">Alternatively, upload your syllabus as a PDF.</p>
                {pdfFile && <p className="text-sm text-muted-foreground">Selected: {pdfFile.name}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="availability">Your Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., 'Mon-Fri 9AM-5PM, Weekends flexible'"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="h-11"
                />
                <p className="text-sm text-muted-foreground">Tell us when you're typically free.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Desired Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11"
                />
                <p className="text-sm text-muted-foreground">When do you want your study plan to begin?</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="study-time">Daily Study Time</Label>
                <Input
                  id="study-time"
                  placeholder="e.g., '3 hours/day' or '15 hours/week'"
                  value={studyTime}
                  onChange={(e) => setStudyTime(e.target.value)}
                  className="h-11"
                />
                <p className="text-sm text-muted-foreground">How much time can you dedicate daily/weekly?</p>
              </div>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full gradient-primary shadow-glow h-11 text-lg"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Generating Timetable...</>
              ) : (
                <><CalendarIcon className="h-5 w-5 mr-2" /> Generate Timetable</>
              )}
            </Button>
          </CardContent>
        </Card>

        {currentTimetable && (
          <Card className="glass-card border-border/50 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Your Generated Timetable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(currentTimetable).map(([dayKey, tasks]) => (
                <div key={dayKey} className="border-b border-border/50 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-xl capitalize mb-2">{dayKey.replace(/([A-Z])/g, ' $1').trim()}:</h3>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={task.id}
                          checked={task.completed}
                          onCheckedChange={(checked) => handleTaskCompletion(dayKey, task.id, checked as boolean)}
                        />
                        <Label 
                          htmlFor={task.id} 
                          className={`text-base font-normal ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {task.description} ({task.hours} hours)
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
