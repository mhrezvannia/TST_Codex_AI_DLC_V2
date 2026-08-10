<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password')
                            displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        <span>${msg("loginAccountTitle")}</span>
        <span class="linercore-login-instruction">${msg("loginInstruction")}</span>
    <#elseif section = "form">
        <#if realm.password>
            <form id="kc-form-login" action="${url.loginAction}" method="post">
                <#if !usernameHidden??>
                    <div class="${properties.kcFormGroupClass!}">
                        <label for="username" class="${properties.kcLabelClass!}">
                            <#if !realm.loginWithEmailAllowed>
                                ${msg("username")}
                            <#elseif !realm.registrationEmailAsUsername>
                                ${msg("usernameOrEmail")}
                            <#else>
                                ${msg("email")}
                            </#if>
                        </label>
                        <input id="username" class="${properties.kcInputClass!}" name="username"
                               value="${(login.username!'')}" type="text" autocomplete="username"
                               <#if !messagesPerField.existsError('username','password')>autofocus</#if>
                               autocapitalize="none" spellcheck="false"
                               <#if messagesPerField.existsError('username','password')>
                                   aria-invalid="true" aria-describedby="input-error"
                               </#if>>
                    </div>
                </#if>

                <div class="${properties.kcFormGroupClass!}">
                    <label for="password" class="${properties.kcLabelClass!}">${msg("password")}</label>
                    <div class="${properties.kcInputGroup!}">
                        <input id="password" class="${properties.kcInputClass!}" name="password"
                               type="password" autocomplete="current-password"
                               <#if messagesPerField.existsError('username','password')>autofocus</#if>
                               <#if messagesPerField.existsError('username','password')>
                                   aria-invalid="true" aria-describedby="input-error"
                               </#if>>
                        <button class="${properties.kcFormPasswordVisibilityButtonClass!}" type="button"
                                aria-label="${msg("showPassword")}" aria-controls="password"
                                title="${msg("showPassword")}"
                                data-password-toggle
                                data-icon-show="${properties.kcFormPasswordVisibilityIconShow!}"
                                data-icon-hide="${properties.kcFormPasswordVisibilityIconHide!}"
                                data-label-show="${msg('showPassword')}"
                                data-label-hide="${msg('hidePassword')}">
                            <i class="${properties.kcFormPasswordVisibilityIconShow!}" aria-hidden="true"></i>
                        </button>
                    </div>
                    <p id="linercore-caps-lock" class="linercore-caps-lock" role="status" aria-live="polite" hidden>
                        ${msg("capsLockWarning")}
                    </p>

                    <#if messagesPerField.existsError('username','password')>
                        <p id="input-error" class="${properties.kcInputErrorMessageClass!}" role="alert">
                            ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                        </p>
                    </#if>
                </div>

                <#if realm.rememberMe || realm.resetPasswordAllowed>
                    <div class="${properties.kcFormGroupClass!} ${properties.kcFormSettingClass!}">
                        <#if realm.rememberMe && !usernameHidden??>
                            <label class="linercore-checkbox">
                                <input id="rememberMe" name="rememberMe" type="checkbox"
                                       <#if login.rememberMe??>checked</#if>>
                                <span>${msg("rememberMe")}</span>
                            </label>
                        </#if>
                        <#if realm.resetPasswordAllowed>
                            <a href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                        </#if>
                    </div>
                </#if>

                <div id="kc-form-buttons" class="${properties.kcFormGroupClass!}">
                    <input type="hidden" id="id-hidden-input" name="credentialId"
                           <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>>
                    <button class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!}
                                   ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                            name="login" id="kc-login" type="submit"
                            data-submitting-label="${msg('signingIn')}">
                        <span class="linercore-button-label">${msg("doLogIn")}</span>
                        <span class="linercore-button-spinner" aria-hidden="true"></span>
                    </button>
                </div>
            </form>
        </#if>
        <script type="module" src="${url.resourcesPath}/js/passwordVisibility.js"></script>
    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-registration-container">
                <span>${msg("noAccount")} <a href="${url.registrationUrl}">${msg("doRegister")}</a></span>
            </div>
        </#if>
    <#elseif section = "socialProviders">
        <#if realm.password && social.providers??>
            <div id="kc-social-providers" class="${properties.kcFormSocialAccountSectionClass!}">
                <hr>
                <h2>${msg("identity-provider-login-label")}</h2>
                <ul class="${properties.kcFormSocialAccountListClass!}">
                    <#list social.providers as provider>
                        <li>
                            <a id="social-${provider.alias}"
                               class="${properties.kcFormSocialAccountListButtonClass!}"
                               href="${provider.loginUrl}">
                                <#if provider.iconClasses?has_content>
                                    <i class="${properties.kcCommonLogoIdP!} ${provider.iconClasses!}" aria-hidden="true"></i>
                                </#if>
                                <span class="${properties.kcFormSocialAccountNameClass!}">${provider.displayName!}</span>
                            </a>
                        </li>
                    </#list>
                </ul>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
