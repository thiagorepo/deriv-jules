import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/libs/shared/ui/src/components/ui/card';
import { Button } from '@/libs/shared/ui/src/components/ui/button';
import { Input } from '@/libs/shared/ui/src/components/ui/input';
import { Badge } from '@/libs/shared/ui/src/components/ui/badge';

/**
 * Overview Page
 * Main dashboard showing platform overview
 */
export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to Deriv Jules - Multi-tenant trading platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Active Tenants
              </CardTitle>
              <CardDescription>Number of tenant accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <Badge variant="secondary" className="mt-2">
                Live
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <CardDescription>
                User accounts across all tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <Badge variant="secondary" className="mt-2">
                +12% this month
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Revenue (MTD)
              </CardTitle>
              <CardDescription>Monthly recurring revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,678</div>
              <Badge variant="secondary" className="mt-2">
                +8% vs last month
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
              <CardDescription>
                Current system health and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="outline">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Auth Service</span>
                </div>
                <Badge variant="outline">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">Stripe</span>
                </div>
                <Badge variant="outline">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">API Gateway</span>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="ghost">
                <span>Create New Tenant</span>
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <span>Manage Users</span>
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <span>Configure Plans</span>
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <span>View Analytics</span>
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <span>Access Documentation</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest tenant and user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                <div>
                  <div className="text-sm font-medium">
                    New user registration
                  </div>
                  <div className="text-xs text-muted-foreground">
                    user@example.com
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  2 minutes ago
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                <div>
                  <div className="text-sm font-medium">Tenant created</div>
                  <div className="text-xs text-muted-foreground">Acme Corp</div>
                </div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                <div>
                  <div className="text-sm font-medium">
                    Subscription payment
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Premium Plan
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">3 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
