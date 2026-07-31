<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}" lang="<#if locale??>${locale.currentLanguageTag}<#else>en</#if>">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="robots" content="noindex, nofollow">

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}">
        </#list>
    </#if>

    <title>${msg("loginTitle", (realm.displayName!''))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico">

    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet">
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet">
        </#list>
    </#if>
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" defer></script>
        </#list>
    </#if>
    <script src="${url.resourcesPath}/js/menu-button-links.js" type="module"></script>

    <#if scripts??>
        <#list scripts as script>
            <script src="${script}"></script>
        </#list>
    </#if>
    <#if authenticationSession??>
        <script type="module">
            import { checkCookiesAndSetTimer } from "${url.resourcesPath}/js/authChecker.js";
            checkCookiesAndSetTimer(
                "${authenticationSession.authSessionId}",
                "${authenticationSession.tabId}",
                "${url.ssoLoginInOtherTabsUrl?no_esc}"
            );
        </script>
    </#if>
</head>

<body class="${properties.kcBodyClass!} ${bodyClass}">
<a class="linercore-skip-link" href="#kc-content">${msg("skipToSignIn")}</a>

<main class="${properties.kcLoginClass!}">
    <div id="kc-header" class="${properties.kcHeaderClass!}">
        <div class="linercore-brand-row">
            <span class="linercore-wordmark">LinerCore</span>
            <span class="linercore-environment">${properties.environmentLabel!'LOCAL DEMO'}</span>
        </div>
        <p class="linercore-product-context">Shipping operations platform</p>
    </div>

    <section class="${properties.kcFormCardClass!}" aria-labelledby="kc-page-title">
        <header class="${properties.kcFormHeaderClass!}">
            <#if realm.internationalizationEnabled && locale.supported?size gt 1>
                <div class="${properties.kcLocaleMainClass!}" id="kc-locale">
                    <div id="kc-locale-wrapper" class="${properties.kcLocaleWrapperClass!}">
                        <div id="kc-locale-dropdown" class="menu-button-links ${properties.kcLocaleDropDownClass!}">
                            <button id="kc-current-locale-link" aria-label="${msg("languages")}" aria-haspopup="true"
                                    aria-expanded="false" aria-controls="language-switch1">${locale.current}</button>
                            <ul role="menu" tabindex="-1" aria-labelledby="kc-current-locale-link"
                                id="language-switch1" class="${properties.kcLocaleListClass!}">
                                <#assign i = 1>
                                <#list locale.supported as l>
                                    <li class="${properties.kcLocaleListItemClass!}" role="none">
                                        <a role="menuitem" id="language-${i}" class="${properties.kcLocaleItemClass!}"
                                           href="${l.url}">${l.label}</a>
                                    </li>
                                    <#assign i++>
                                </#list>
                            </ul>
                        </div>
                    </div>
                </div>
            </#if>

            <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
                <#if displayRequiredFields>
                    <p class="linercore-required-fields"><span aria-hidden="true">*</span> ${msg("requiredFields")}</p>
                </#if>
                <h1 id="kc-page-title"><#nested "header"></h1>
            <#else>
                <#nested "show-username">
                <div id="kc-username" class="${properties.kcFormGroupClass!}">
                    <span id="kc-attempted-username">${auth.attemptedUsername}</span>
                    <a id="reset-login" href="${url.loginRestartFlowUrl}" aria-label="${msg("restartLoginTooltip")}">
                        <i class="${properties.kcResetFlowIcon!}" aria-hidden="true"></i>
                    </a>
                </div>
            </#if>
        </header>

        <div id="kc-content">
            <div id="kc-content-wrapper">
                <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="alert-${message.type} ${properties.kcAlertClass!} pf-m-<#if message.type = 'error'>danger<#else>${message.type}</#if>"
                         role="<#if message.type = 'error'>alert<#else>status</#if>"
                         aria-live="<#if message.type = 'error'>assertive<#else>polite</#if>">
                        <div class="pf-c-alert__icon" aria-hidden="true">
                            <#if message.type = 'success'><span class="${properties.kcFeedbackSuccessIcon!}"></span></#if>
                            <#if message.type = 'warning'><span class="${properties.kcFeedbackWarningIcon!}"></span></#if>
                            <#if message.type = 'error'><span class="${properties.kcFeedbackErrorIcon!}"></span></#if>
                            <#if message.type = 'info'><span class="${properties.kcFeedbackInfoIcon!}"></span></#if>
                        </div>
                        <span class="${properties.kcAlertTitleClass!}">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <#nested "form">

                <#if auth?has_content && auth.showTryAnotherWayLink()>
                    <form id="kc-select-try-another-way-form" action="${url.loginAction}" method="post">
                        <div class="${properties.kcFormGroupClass!}">
                            <input type="hidden" name="tryAnotherWay" value="on">
                            <button class="linercore-text-button" type="submit">${msg("doTryAnotherWay")}</button>
                        </div>
                    </form>
                </#if>

                <#nested "socialProviders">

                <#if displayInfo>
                    <div id="kc-info" class="${properties.kcSignUpClass!}">
                        <div id="kc-info-wrapper" class="${properties.kcInfoAreaWrapperClass!}">
                            <#nested "info">
                        </div>
                    </div>
                </#if>
            </div>
        </div>
    </section>

    <footer class="linercore-login-footer">
        <span>${msg("authorizedUsersOnly")}</span>
        <span aria-hidden="true">&middot;</span>
        <span>${msg("accessSupport")}</span>
    </footer>
</main>
</body>
</html>
</#macro>
