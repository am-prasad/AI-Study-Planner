import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

export default function Timetable() {
  return (
    <Layout>
      <div className="space-y-8 pb-20 md:pb-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary">Study Timetable</h1>
          <p className="text-muted-foreground mt-2">Plan and organize your study sessions</p>
        </div>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Interactive Timetable</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Smart scheduling with drag-and-drop functionality will be available soon
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
