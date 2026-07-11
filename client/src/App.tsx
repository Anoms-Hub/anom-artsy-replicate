import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Games from "./pages/Games";
import UniverseMap from "./pages/UniverseMap";
import FinancialDistrict from "./pages/FinancialDistrict";
import CreatorWorlds from "./pages/CreatorWorlds";
import MemberProfile from "@/pages/MemberProfile";
import AnomsCorner from "@/pages/AnomsCorner";
import WorkGallery from "@/pages/WorkGallery";
import CustomServices from "@/pages/CustomServices";
import Settings from "@/pages/Settings";
import TermsOfService from "@/pages/TermsOfService";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/games"} component={Games} />
      <Route path={"/universe"} component={UniverseMap} />
      <Route path={"/financial-district"} component={FinancialDistrict} />
      <Route path={"/worlds"} component={CreatorWorlds} />
      <Route path={"/profile/:username"} component={MemberProfile} />
      <Route path={"/anoms-corner"} component={AnomsCorner} />
      <Route path={"/work"} component={WorkGallery} />
      <Route path={"/services"} component={CustomServices} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
