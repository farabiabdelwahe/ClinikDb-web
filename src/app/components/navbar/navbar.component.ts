import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { User } from "@angular/fire/auth";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = "home";
  showLoginModal = false;
  user$ = this.authService.user$;
  appUser$ = this.authService.appUser$;
  isAdmin$ = this.authService.isAdmin$;
  userMenuOpen = false;

  @ViewChild("userMenuContainer") userMenuContainer?: ElementRef<HTMLElement>;

  navItems = [
    { labelKey: "Features", section: "features", icon: "dashboard" },
    { labelKey: "How it Works", section: "how-it-works", icon: "build" },
    { labelKey: "Pricing", section: "pricing", icon: "attach_money" },
    { labelKey: "Testimonials", section: "testimonials", icon: "star" },
  ];

  private scrollListener = () => {
    this.isScrolled = window.scrollY > 20;
  };

  ngOnInit(): void {
    window.addEventListener("scroll", this.scrollListener);
    this.checkActiveSection();
  }

  @HostListener("window:scroll")
  onScroll(): void {
    this.checkActiveSection();
  }

  checkActiveSection(): void {
    const sections = ["features", "how-it-works", "pricing", "testimonials"];
    const scrollPosition = window.scrollY + 100;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          this.activeSection = section;
          return;
        }
      }
    }

    if (window.scrollY < 100) {
      this.activeSection = "home";
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener("scroll", this.scrollListener);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  scrollToSection(sectionId: string): void {
    this.closeMobileMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  scrollToTop(): void {
    this.closeMobileMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  goToDashboard(): void {
    this.router.navigate(["/admin"]);
    this.closeMobileMenu();
  }

  // Login modal handlers
  openLoginModal(): void {
    this.showLoginModal = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed", error);
    } finally {
      this.closeLoginModal();
    }
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  async logout(): Promise<void> {
    this.userMenuOpen = false;
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  }

  getUserInitials(user: User | null): string {
    if (!user) {
      return "";
    }
    const displaySource = user.displayName || user.email || "";
    const parts = displaySource.trim().split(/\s+/);
    const initials = parts
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "");
    return initials.join("") || "?";
  }

  getUserPhoto(user: User | null): string | null {
    if (!user) {
      return null;
    }

    return (
      user.photoURL ||
      user.providerData?.find((profile) => !!profile?.photoURL)?.photoURL ||
      null
    );
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    if (!this.userMenuOpen) {
      return;
    }

    const target = event.target as Node | null;
    if (
      target &&
      this.userMenuContainer?.nativeElement &&
      this.userMenuContainer.nativeElement.contains(target)
    ) {
      return;
    }

    this.userMenuOpen = false;
  }
}
