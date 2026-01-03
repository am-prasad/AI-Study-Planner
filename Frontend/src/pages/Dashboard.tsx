import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Target, 
  Flame,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useSubjectsStore } from '@/store/subjectsStore';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const subjects = useSubjectsStore((state) => state.subjects);

  const totalSubjects = subjects.length;
  const totalHours = subjects.reduce((sum, s) => sum + s.totalHours, 0);
  const completedHours = subjects.reduce((sum, s) => sum + s.completedHours, 0);
  const overallProgress = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  const stats = [
    {
      title: 'Total Subjects',
      value: totalSubjects,
      icon: BookOpen,
      gradient: 'gradient-primary',
    },
    {
      title: 'Study Hours',
      value: `${completedHours}/${totalHours}h`,
      icon: Clock,
      gradient: 'gradient-accent',
    },
    {
      title: 'Overall Progress',
      value: `${overallProgress}%`,
      icon: TrendingUp,
      gradient: 'gradient-warm',
    },
    {
      title: 'Study Streak',
      value: '7 days',
      icon: Flame,
      gradient: 'gradient-warm',
    },
  ];

  const upcomingSessions = [
    { subject: 'Mathematics', time: '10:00 AM', type: 'Study' },
    { subject: 'Physics', time: '2:00 PM', type: 'Revision' },
    { subject: 'Chemistry', time: '4:30 PM', type: 'Practice' },
  ];

  const todaysTasks = [
    { task: 'Complete Chapter 3 exercises', subject: 'Mathematics', completed: false },
    { task: 'Review Newton\'s Laws', subject: 'Physics', completed: true },
    { task: 'Memorize Periodic Table', subject: 'Chemistry', completed: false },
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-20 md:pb-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold">
            Welcome back, <span className="text-gradient-primary">{user?.name}</span>! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's your learning overview for today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.title} variants={item}>
                <Card className="glass-card border-border/50 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`h-12 w-12 rounded-xl ${stat.gradient} flex items-center justify-center shadow-glow`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysTasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`h-5 w-5 rounded-full border-2 mt-0.5 ${
                      task.completed 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {task.completed && (
                        <CheckCircle2 className="h-full w-full text-white p-0.5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.task}
                      </p>
                      <p className="text-sm text-muted-foreground">{task.subject}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{session.subject}</p>
                      <p className="text-sm text-muted-foreground">{session.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{session.time}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subject Progress */}
        {subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Subject Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {subjects.map((subject, index) => {
                  const progress = subject.totalHours > 0 
                    ? Math.round((subject.completedHours / subject.totalHours) * 100)
                    : 0;
                  
                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {subject.completedHours}/{subject.totalHours}h ({progress}%)
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Motivation Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 border-border/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-10">
            <Sparkles className="h-32 w-32 text-primary" />
          </div>
          <div className="relative">
            <h3 className="text-xl font-bold mb-2">💡 Today's Insight</h3>
            <p className="text-muted-foreground">
              "The secret of getting ahead is getting started. Keep up the great work!"
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
