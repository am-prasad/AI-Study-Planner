import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function Analytics() {
  return (
    <Layout>
      <div className="space-y-8 pb-20 md:pb-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your learning progress</p>
        </div>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Comprehensive charts and insights about your study patterns will be available soon
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
