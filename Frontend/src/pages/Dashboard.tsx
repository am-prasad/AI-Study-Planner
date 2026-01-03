import { Layout } from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { useSubjectsStore } from '@/store/subjectsStore';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const subjects = useSubjectsStore((state) => state.subjects);

  const totalSubjects = subjects.length;
  const totalHours = subjects.reduce((sum, s) => sum + s.totalHours, 0);
  const completedHours = subjects.reduce((sum, s) => sum + s.completedHours, 0);
  const progress = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  // Derive tasks from incomplete chapters
  const pendingChapters = subjects.flatMap(s => 
    s.chapters.filter(c => !c.completed).map(c => ({ ...c, subjectName: s.name }))
  ).slice(0, 5);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Student'}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><CardContent className="p-6 flex justify-between">
            <div><p className="text-sm text-muted-foreground">Subjects</p><p className="text-2xl font-bold">{totalSubjects}</p></div>
            <BookOpen className="text-primary" />
          </CardContent></Card>
          
          <Card><CardContent className="p-6 flex justify-between">
            <div><p className="text-sm text-muted-foreground">Study Hours</p><p className="text-2xl font-bold">{completedHours}/{totalHours}h</p></div>
            <Clock className="text-accent" />
          </CardContent></Card>

          <Card><CardContent className="p-6 flex justify-between">
            <div><p className="text-sm text-muted-foreground">Total Progress</p><p className="text-2xl font-bold">{progress}%</p></div>
            <TrendingUp className="text-green-500" />
          </CardContent></Card>
        </div>

        <Card>
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