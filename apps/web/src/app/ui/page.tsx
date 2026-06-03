import { Badge } from '@mvp-realty/ui/components/ui/badge';
import { Button } from '@mvp-realty/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@mvp-realty/ui/components/ui/card';
import { Input } from '@mvp-realty/ui/components/ui/input';
import { Label } from '@mvp-realty/ui/components/ui/label';

/**
 * shadcn/ui component gallery. A smoke-test surface for the design system —
 * every component lives in `@mvp-realty/ui`; add more sections here as you go.
 */
export default function UiGallery() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">UI kit</h1>
        <p className="text-muted-foreground">
          shadcn/ui components, served from <code>@mvp-realty/ui</code>.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Badge>Badge</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Verifies cards, inputs, and labels render.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Continue</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
