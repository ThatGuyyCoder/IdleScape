import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Fish, TreePine, Flame, Star, Clock, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Landing() {
  const [, setLocation] = useLocation();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handlePlayAsGuest = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Theme switcher in top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-primary font-serif mb-4" data-testid="landing-title">
            AFK Skills
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="landing-subtitle">
            Master the art of idle progression. Train your skills, collect resources, and become the ultimate adventurer - even when you're away!
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="skill-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Hammer className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>Mining</CardTitle>
              <CardDescription>
                Dig deep for precious ores and gems
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="skill-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Fish className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Fishing</CardTitle>
              <CardDescription>
                Cast your line and catch amazing fish
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="skill-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TreePine className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Woodcutting</CardTitle>
              <CardDescription>
                Chop trees for valuable lumber
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="skill-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Cooking</CardTitle>
              <CardDescription>
                Create delicious meals and treats
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Clock className="w-8 h-8 text-secondary mb-4" />
              <CardTitle>Offline Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your skills continue to improve even when you're not playing. Come back to find your progress waiting for you!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-secondary mb-4" />
              <CardTitle>Skill Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Level up your skills, unlock new resources, and increase your efficiency with better equipment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Star className="w-8 h-8 text-secondary mb-4" />
              <CardTitle>Collect & Craft</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gather resources, manage your inventory, and equip powerful gear to boost your skill training.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleLogin}
              size="lg"
              className="px-8 py-4 text-lg bg-primary hover:bg-primary/90"
              data-testid="login-button"
            >
              Log In & Save Progress
            </Button>
            <Button
              onClick={handlePlayAsGuest}
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg"
              data-testid="guest-button"
            >
              Play as Guest
            </Button>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Log in to save your progress across devices</p>
            <p>Or play as a guest (progress not saved)</p>
          </div>
        </div>
      </div>
    </div>
  );
}