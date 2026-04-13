import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { fadeInVariants } from "@/lib/animations";

export function HomePage() {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="p-6 space-y-6"
    >
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="text-muted-foreground">
        You are authenticated. Start building your internal tool here.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Edit{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                src/pages/home/page.tsx
              </code>{" "}
              to customize this page. Add new pages in{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                src/pages/
              </code>{" "}
              and register routes in{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                src/App.tsx
              </code>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              shadcn/ui components are pre-installed in{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                src/components/ui/
              </code>
              . Add more with{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                npx shadcn@latest add
              </code>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Google OAuth is handled by Cloudflare middleware. Only{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                @quatt.io
              </code>{" "}
              accounts can access this app. No auth code needed in your pages.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
