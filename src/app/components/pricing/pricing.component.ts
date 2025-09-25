import { Component, signal, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  LucideAngularModule,
  Check,
  Sparkles,
  Rocket,
  Crown,
  Tag,
  Gift,
  CheckCircle,
  X,
} from "lucide-angular";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { FormsModule } from "@angular/forms";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatBadgeModule } from "@angular/material/badge";
import { MatDividerModule } from "@angular/material/divider";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { environment } from "../../../environments/environment";
import { TranslationService } from "../../services/translation.service";
import { Subscription } from "rxjs";
import { TranslatePipe } from "../../pipes/translate.pipe";

interface PricingPlan {
  key: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  buttonText: string;
  badge?: string;
  icon?: any;
  gradient?: string;
}

type PromoStatus = "collapsed" | "open" | "validating" | "applied" | "error";

interface PromoState {
  code: string;
  discount: number;
  status: PromoStatus;
  messageKey: string; // translation key representing state message
  messageParams?: Record<string, any>;
}

@Component({
  selector: "app-pricing",
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    FormsModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: "./pricing.component.html",
  styleUrls: ["./pricing.component.scss"],
})
export class PricingComponent implements OnInit, OnDestroy {
  // Icons
  readonly Check = Check;
  readonly Sparkles = Sparkles;
  readonly Rocket = Rocket;
  readonly Crown = Crown;
  readonly Tag = Tag;
  readonly Gift = Gift;
  readonly CheckCircle = CheckCircle;
  readonly X = X;

  // Feature flag
  readonly featureAgentCommission = !!environment.features?.agentCommission;
  readonly region = environment.region;

  // Referral / Promo handling
  promoInput = "";
  promoState = signal<PromoState>({
    code: "",
    discount: 0,
    status: this.featureAgentCommission ? "collapsed" : "collapsed",
    messageKey: "pricing.referral.info",
  });

  private VALID_PATTERN = /^[A-Z0-9]{4,18}$/;

  // Mock referral codes (would be replaced by backend call)
  private mockValidCodes: Record<string, number> = {
    AGENT10: 10,
    AGENT15: 15,
    AGENT20: 20,
    LAUNCH25: 25,
    ALICE20: 20,
    BOB10: 10,
  };

  // Base plan config (language agnostic)
  private basePlanConfigs = [
    {
      key: "free",
      price: 0,
      highlighted: false,
      icon: this.Sparkles,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      key: "annual",
      price: 299,
      highlighted: true,
      icon: this.Rocket,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      key: "pro",
      price: 599,
      highlighted: false,
      icon: this.Crown,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
  ];

  plans: PricingPlan[] = [];

  // Language subscription
  private langSub?: Subscription;

  constructor(
    private snackBar: MatSnackBar,
    private translation: TranslationService,
  ) {}

  ngOnInit(): void {
    this.buildLocalizedPlans();
    this.langSub = this.translation.currentLang$.subscribe(() => {
      this.buildLocalizedPlans();
      // Recompute referral state message (translation keys) after language change
      const current = this.promoState();
      this.promoState.set({ ...current }); // triggers template update with new translation
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  /**
   * Build localized plan objects on each language change.
   */
  private buildLocalizedPlans(): void {
    const t = (key: string, params?: any) =>
      this.translation.translate(key, params);

    const freeFeatures = [
      `${t("pricing.features.upTo", { count: 5 })} ${t("pricing.features.patientRecords")}`,
      `${t("pricing.features.basic")} ${t("pricing.features.scheduling")}`,
      `${t("pricing.features.email")} ${t("pricing.features.support")}`,
      `${t("pricing.features.standard")} ${t("pricing.features.reporting")}`,
      t("pricing.features.mobileApp"),
      t("pricing.features.dataExport"),
    ];

    const annualFeatures = [
      `${t("pricing.features.unlimited")} ${t("pricing.features.patientRecords")}`,
      `${t("pricing.features.advanced")} ${t("pricing.features.scheduling")}`,
      `${t("pricing.features.priority")} ${t("pricing.features.support")}`,
      `${t("pricing.features.custom")} ${t("pricing.features.reporting")}`,
      t("pricing.features.apiIntegrations"),
      t("pricing.features.mobileApp"),
      t("pricing.features.automatedWorkflows"),
      t("pricing.features.analytics"),
      t("pricing.features.dataBackup"),
    ];

    const proFeatures = [
      t("pricing.features.everything"),
      t("pricing.features.multiLocation"),
      t("pricing.features.accountManager"),
      `${t("pricing.features.advanced")} ${t("pricing.features.analytics")}`,
      `${t("pricing.features.custom")} ${t("pricing.features.apiIntegrations")}`,
      t("pricing.features.whiteLabel"),
      t("pricing.features.hipaaTools"),
      t("pricing.features.advancedReporting"),
      t("pricing.features.featureRequests"),
      t("pricing.features.phoneSupport"),
    ];

    this.plans = this.basePlanConfigs.map((cfg) => {
      const planKeyBase = `pricing.plans.${cfg.key}`;
      return {
        key: cfg.key,
        name: t(`${planKeyBase}.name`),
        price: cfg.price,
        period: t(`${planKeyBase}.period`),
        description: t(`${planKeyBase}.description`),
        features:
          cfg.key === "free"
            ? freeFeatures
            : cfg.key === "annual"
              ? annualFeatures
              : proFeatures,
        highlighted: cfg.highlighted,
        buttonText: t(`${planKeyBase}.buttonText`),
        badge:
          cfg.key === "annual" ? t("pricing.plans.annual.badge") : undefined,
        icon: cfg.icon,
        gradient: cfg.gradient,
      };
    });
  }

  // Promo / Referral logic

  toggleReferralPanel(): void {
    if (!this.featureAgentCommission) return;
    const current = this.promoState();
    this.promoState.set({
      ...current,
      status: current.status === "collapsed" ? "open" : "collapsed",
    });
  }

  onReferralInput(value: string): void {
    const sanitized = value
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/[^A-Z0-9]/g, "");
    this.promoInput = sanitized;
    const st = this.promoState();
    if (st.status === "error") {
      this.promoState.set({
        ...st,
        status: "open",
        messageKey: "pricing.referral.info",
        messageParams: {},
      });
    }
  }

  canApply(): boolean {
    const st = this.promoState();
    return (
      this.featureAgentCommission &&
      (st.status === "open" || st.status === "error") &&
      !!this.promoInput &&
      this.VALID_PATTERN.test(this.promoInput)
    );
  }

  applyReferral(): void {
    if (!this.featureAgentCommission) return;

    const code = this.promoInput;
    if (!code || !this.VALID_PATTERN.test(code)) {
      this.setReferralError("pricing.referral.errorInvalid");
      return;
    }

    this.promoState.set({
      ...this.promoState(),
      status: "validating",
      messageKey: "pricing.referral.validating",
      messageParams: {},
    });

    // Simulate async validation
    setTimeout(() => {
      const discount = this.mockValidCodes[code];
      if (discount) {
        this.promoState.set({
          code,
          discount,
          status: "applied",
          messageKey: "pricing.referral.applied",
          messageParams: {},
        });
        this.snackBar.open(
          this.translation.translate("pricing.referral.discount", {
            percentage: discount,
          }),
          this.translation.translate("common.close") || "Close",
          {
            duration: 2500,
            horizontalPosition: "center",
            verticalPosition: "bottom",
            panelClass: ["success-snackbar"],
          },
        );
      } else {
        this.setReferralError("pricing.referral.errorInvalid");
      }
    }, 850);
  }

  removeReferral(): void {
    if (!this.featureAgentCommission) return;
    this.promoInput = "";
    this.promoState.set({
      code: "",
      discount: 0,
      status: "open",
      messageKey: "pricing.referral.cleared",
      messageParams: {},
    });
  }

  private setReferralError(messageKey: string): void {
    this.promoState.set({
      code: "",
      discount: 0,
      status: "error",
      messageKey,
      messageParams: {},
    });
  }

  get discountPercentage(): number {
    return this.promoState().discount;
  }

  getDiscountedPrice(price: number): number {
    if (this.discountPercentage && price > 0) {
      return (
        Math.round((price - (price * this.discountPercentage) / 100) * 100) /
        100
      );
    }
    return price;
  }

  subscribe(plan: PricingPlan): void {
    const discounted = this.getDiscountedPrice(plan.price);
    const hasDiscount = this.promoState().status === "applied";
    const code = this.promoState().code;
    // Using translation keys for composed message (fallback if not defined)
    const baseMsgKey =
      plan.price === 0
        ? "pricing.subscription.trial"
        : "pricing.subscription.standard";
    const msg = hasDiscount
      ? this.translation.translate("pricing.subscription.withDiscount", {
          plan: plan.name,
          code,
          percentage: this.discountPercentage,
          amount: discounted,
          period: plan.period,
        })
      : this.translation.translate(baseMsgKey, {
          plan: plan.name,
          amount: discounted,
          period: plan.period,
        });

    this.snackBar.open(
      msg,
      this.translation.translate("common.close") || "Close",
      {
        duration: 4500,
        horizontalPosition: "center",
        verticalPosition: "bottom",
      },
    );
  }

  currencySymbol(): string {
    return this.region === "tn"
      ? this.translation.translate("pricing.currencyTND") || "DT"
      : this.translation.translate("pricing.currencyUSD") || "$";
  }

  showPartnerInfo(): boolean {
    return this.featureAgentCommission;
  }

  // Helpers for translation in template (avoid inline calls clutter)
  t(key: string, params?: any): string {
    return this.translation.translate(key, params);
  }

  trackByPlan(index: number, plan: PricingPlan): string {
    return plan.key;
  }
}
