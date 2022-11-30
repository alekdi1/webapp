<template>
  <div class="tnc-view">
    <div class="general-container mb-5">
      <div class="cpn-content-default text-gray">
        {{ text.maincontent }}
        <br /><br />
        {{ text.maincontent1 }}
      </div>
    </div>

    <div class="condition-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        1. {{ text.TermsofService }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.TermsofService1 }}

        <br /><br />

        {{ text.TermsofService2 }}
      </div>
    </div>

    <div class="property-right-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        2. {{ text.OwnershipandIntellectualProperty }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.OwnershipandIntellectualProperty1 }}

        <br /><br />
        {{ text.OwnershipandIntellectualProperty2 }}
      </div>
    </div>

    <div class="liability-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        3. {{ text.DisclaimerandLimitationofLiability }}
      </div>
      <div class="cpn-content-default text-gray">
        3.1 {{ text.DisclaimerandLimitationofLiability1 }} <br /><br />
        3.2 {{ text.DisclaimerandLimitationofLiability2 }} <br /><br />
        3.3 {{ text.DisclaimerandLimitationofLiability3 }} <br /><br />
        3.4 {{ text.DisclaimerandLimitationofLiability4 }}
      </div>
    </div>

    <div class="privacy-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        4. {{ text.PrivacyPolicy }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.PrivacyPolicy1 }}
        <a :href="text.url" target="_blank">{{ text.PrivacyPolicyurl }}</a>
      </div>
    </div>

    <div class="connection-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        5. {{ text.Hyperlinks }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.Hyperlinks1 }}
      </div>
    </div>

    <div class="user-password-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        6. {{ text.Identification }}
      </div>
      <div class="cpn-content-default text-gray">
        6.1 {{ text.Identification1 }} <br /><br />
        6.2 {{ text.Identification2 }}
      </div>
    </div>

    <div class="access-right-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        7. {{ text.RighttoAccess }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.RighttoAccess1 }}
      </div>
    </div>

    <div class="violation-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        8.{{ text.Cookies }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.Cookies1 }}

        <br /><br />

        {{ text.Cookies2 }}

        <br /><br />

        {{ text.Cookies3 }}
        <a :href="text.urlcookie" target="_blank">{{ text.cookiesurl }}</a>
      </div>
    </div>

    <div class="indemnification-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        9. {{ text.TermsandConditions }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.TermsandConditions1 }}
      </div>
    </div>

    <div class="disclaimer-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        10. {{ text.Compensation }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.Compensation1 }}
      </div>
    </div>

    <div class="law-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        11.{{ text.ReservedMatter }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.ReservedMatter1 }}
      </div>
    </div>

    <div class="law-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        12. {{ text.GoverningLaws }}
      </div>
      <div class="cpn-content-default text-gray">
        {{ text.GoverningLaws1 }}
      </div>
    </div>
    <div class="law-container mb-5">
      <div class="cpn-content-title text-primary mb-2">
        13. {{ text.ContactUs }}
      </div>

      <div class="cpn-content-default text-gray">
        {{ text.ContactUs1 }}
        <br /><br />
        <li>{{ text.ContactUs2 }}</li>
        <li>
          {{ text.ContactUs3 }}
        </li>
        <li>{{ text.ContactUs4 }}</li>
      </div>
    </div>
  </div>
</template>
<script src="./index.ts" lang="ts"></script>
<style lang="scss" scoped>
</style>
