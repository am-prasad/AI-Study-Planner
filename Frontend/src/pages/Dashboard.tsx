import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { useSubjectsStore } from '@/store/subjectsStore';
import { useTimetableStore } from '@/store/timetableStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, TrendingUp, CheckCircle2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthInitialized } = useAuthStore();
  const subjects = useSubjectsStore((state) => state.subjects);
  const { currentTimetable, setTimetable } = useTimetableStore();
  const [loadingTimetable, setLoadingTimetable] = useState(true);

  const totalSubjects = subjects.length;
  const totalHours = subjects.reduce((sum, s) => sum + s.totalHours, 0);
  const completedHours = subjects.reduce((sum, s) => sum + s.completedHours, 0);
  const progress = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  // Derive tasks from incomplete chapters
  const pendingChapters = subjects.flatMap(s => 
    s.chapters.filter(c => !c.completed).map(c => ({ ...c, subjectName: s.name }))
  ).slice(0, 5);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (user?.uid && isAuthInitialized) {
        setLoadingTimetable(true);
        try {
          const response = await authenticatedFetch(`/timetables/${user.uid}`);
          // Assuming response.data.timetable holds the actual timetable structure
          if (response.data && response.data.timetable) {
             setTimetable(response.data.timetable); 
          } else if (response.timetable) { // Fallback for direct response.timetable
             setTimetable(response.timetable);
          } else {
             setTimetable(null);
          }

        } catch (error) {
          console.error("Failed to fetch timetable:", error);
          setTimetable(null); // Clear timetable if fetching fails
        } finally {
          setLoadingTimetable(false);
        }
      } else if (isAuthInitialized && !user?.uid) {
        // If auth initialized but no user, stop loading immediately
        setLoadingTimetable(false);
        setTimetable(null);
      }
    };

    fetchTimetable();
  }, [user?.uid, isAuthInitialized, setTimetable]);

  return (
    <Layout>
      <div className="space-y-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold text-gradient-primary">Welcome, {user?.displayName || 'Student'}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-border/50"><CardContent className="p-6 flex justify-between">
            <div><p className="text-sm text-muted-foreground">Subjects</p><p className="text-2xl font-bold">{totalSubjects}</p></div>
            <BookOpen className="text-primary" />
          </CardContent></Card>
          
          <Card className="glass-card border-border/50"><CardContent className="p-6 flex justify-between">
            <div><p className="text-sm text-muted-foreground">Study Hours</p><p className="text-2xl font-bold">{completedHours}/{totalHours}h</p></div>
            <Clock className="text-accent" />
          </CardContent></Card>

          <Card className="glass-card border-border/50"><CardContent className="p-6 flex justify-between">
            <div><p className="text-sm text-muted-foreground">Total Progress</p><p className="text-2xl font-bold">{progress}%</p></div>
            <TrendingUp className="text-green-500" />
          </CardContent></Card>
        </div>

        {/* Current Timetable Card */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Your Study Timetable
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {loadingTimetable ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading timetable...</p>
              </div>
            ) : currentTimetable && Object.keys(currentTimetable).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(currentTimetable).map(([dayKey, tasks]) => (
                  <div key={dayKey} className="border-b border-border/50 pb-3 last:border-b-0">
                    <h3 className="font-semibold text-lg capitalize mb-1">{dayKey.replace(/([A-Z])/g, ' $1').trim()}:</h3>
                    <div className="space-y-1">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center space-x-2 text-sm">
                          <CheckCircle2 className={`h-4 w-4 ${task.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <span className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.description} ({task.hours} hours)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 space-y-2">
                <p className="text-muted-foreground">No timetable generated yet.</p>
                <Link to="/timetable">
                  <Button className="gradient-primary shadow-glow">Generate My Timetable</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing Current Study Tasks Card */}
        <Card className="glass-card border-border/50">
          <div className="p-6 border-b font-bold">Current Study Tasks</div>
          <CardContent className="p-6 space-y-4">
            {pendingChapters.length > 0 ? pendingChapters.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{ch.name}</p>
                  <p className="text-xs text-muted-foreground">{ch.subjectName}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-muted" />
              </div>
            )) : <p className="text-muted-foreground">No pending tasks. Add a subject to begin!</p>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
