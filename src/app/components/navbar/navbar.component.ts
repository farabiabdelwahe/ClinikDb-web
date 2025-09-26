import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
// import { AuthService } from "../../services/auth.service"; // Temporarily commented out to avoid circular dependency

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  // private authService = inject(AuthService); // Temporarily commented out

  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = "home";
  showLoginModal = false;
  // user$ = this.authService.user$; // Temporarily commented out

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

  loginWithGoogle(): void {
    console.log('Login functionality temporarily disabled - Firebase not configured');
    this.closeLoginModal();
    // Temporarily disabled to avoid circular dependency
    // this.authService
    //   .signInWithGoogle()
    //   .then(() => {
    //     this.closeLoginModal();
    //   })
    //   .catch((err) => {
    //     console.error("Google sign-in failed", err);
    //   });
  }
}
