import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./hooks/useTheme";
import Home from "./pages/Home";
import Games from "./pages/Games";
import OffGrid from "./pages/OffGrid";
import UniverseMap from "./pages/UniverseMap";
import FinancialDistrict from "./pages/FinancialDistrict";
import CreatorWorlds from "./pages/CreatorWorlds";
import MemberProfile from "@/pages/MemberProfile";
import AnomsCorner from "./pages/AnomsCorner";
import AdminShop from "./pages/AdminShop";
import Shop from "./pages/Shop";
import WorkGallery from "@/pages/WorkGallery";
import CustomServices from "@/pages/CustomServices";
import Settings from "@/pages/Settings";
import TermsOfService from "@/pages/TermsOfService";
import Lounge from "@/pages/Lounge";
import Admin from "@/pages/Admin";
import CoinDropOverlay from "@/components/CoinDropOverlay";
import StripeShop from "@/pages/StripeShop";
import Orders from "@/pages/Orders";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/games"} component={Games} />
      <Route path={"/games/off-grid"} component={OffGrid} />
      <Route path={"/universe"} component={UniverseMap} />
      <Route path={"/financial-district"} component={FinancialDistrict} />
      <Route path={"/worlds"} component={CreatorWorlds} />
      <Route path={"/profile/:username"} component={MemberProfile} />
      <Route path="/anoms-corner" component={AnomsCorner} />
        <Route path="/admin/shop" component={AdminShop} />
        <Route path="/shop" component={Shop} />
      <Route path={"/work"} component={WorkGallery} />
      <Route path={"/services"} component={CustomServices} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/lounge"} component={Lounge} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/store"} component={StripeShop} />
      <Route path={"/orders"} component={Orders} />
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

function AppInner() {
  useTheme(); // Apply user's saved theme from profile.backgroundId
  return (
    <>
      <CoinDropOverlay />
      <Router />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <AppInner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
