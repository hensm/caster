﻿Unicode True
SetCompressor /SOLID LZMA

# Registry keys
!define KEY_MANIFEST "Software\Mozilla\NativeMessagingHosts\{{applicationName}}"
!define KEY_UNINSTALL "Software\Microsoft\Windows\CurrentVersion\Uninstall\{{winRegistryKey}}"


!include MUI2.nsh

# Save installer language for uninstallation
!define MUI_LANGDLL_REGISTRY_ROOT HKLM
!define MUI_LANGDLL_REGISTRY_KEY "${KEY_MANIFEST}"
!define MUI_LANGDLL_REGISTRY_VALUENAME "Installer Language"

# MUI general
!define MUI_ABORTWARNING

# Installer pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "{{{licensePath}}}"
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

# Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH


# Translator note: see CONTRIBUTING for more info on how to
# translate NSIS installer strings.
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "German"

# lang:en
LangString MSG__INSTALL_BONJOUR ${LANG_ENGLISH} \
        "Install Bonjour dependency?"
LangString MSG__FIREFOX_OPEN ${LANG_ENGLISH} \
        "Firefox must be closed during uninstallation if the extension is \
        installed. Close Firefox and click $\"Retry$\", click $\"Ignore$\" \
        to force close or $\"Abort$\" to cancel uninstallation."

# lang:es
LangString MSG__INSTALL_BONJOUR ${LANG_SPANISH} \
        "¿Instalar dependencia Bonjour?"
LangString MSG__FIREFOX_OPEN ${LANG_SPANISH} \
        "Firefox debe estar cerrado durante la desinstalación si la extensión \
        está instalada. Cierra Firefox y aprieta $\"Reintentar$\", aprieta \
        $\"Omitir$\" para forzar el cierre o $\"Anular$\" para cancelar la \
        desinstalación."

# lang:de
LangString MSG__INSTALL_BONJOUR ${LANG_GERMAN} \
        "Bonjour installieren?"
LangString MSG__FIREFOX_OPEN ${LANG_GERMAN} \
        "Firefox muss während der Deinstallation geschlossen werden, wenn die \
        Erweiterung installiert ist. Schließen Sie Firefox und klicken Sie auf \
        $\"Wiederholen$\", klicken Sie auf $\"Ignorieren$\". um das Schließen \
        zu erzwingen oder $\"Abbrechen$\", um die Deinstallation abzubrechen."


# Application name
Name "{{applicationName}} v{{applicationVersion}}"

OutFile "{{outputName}}"        # Installer filename
InstallDir "{{executablePath}}" # Installation directory

# Version info
VIProductVersion "{{applicationVersion}}.0"
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductName" "{{applicationName}}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "LegalCopyright" "© {{{registryPublisher}}}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileDescription" "{{applicationName}}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileVersion" "{{applicationVersion}}"

# Need admin privileges for global install
RequestExecutionLevel admin

Section
    SetRegView 64
    SetOutPath $INSTDIR

    # Main executable
    File "{{executableName}}"
    File "{{bindingName}}"
    File "{{manifestName}}"

    # Install Bonjour
    IfFileExists "$SYSDIR\dnssd.dll" skipInstallBonjour
        MessageBox MB_YESNO \
                $(MSG__INSTALL_BONJOUR) \
                IDNO skipInstallBonjour

            File /oname=Bonjour64.msi "C:\Program Files\Bonjour SDK\Installer\Bonjour64.msi"
            ExecWait "msiexec /i $\"$INSTDIR\Bonjour64.msi$\""

    skipInstallBonjour:
    Delete "$INSTDIR\Bonjour64.msi"

    # Native manifest key
    WriteRegStr HKLM "${KEY_MANIFEST}" "" "$INSTDIR\{{manifestName}}"

    # Create and register uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM ${KEY_UNINSTALL} DisplayName "{{applicationName}}"
    WriteRegStr HKLM ${KEY_UNINSTALL} DisplayVersion "{{applicationVersion}}"
    WriteRegStr HKLM ${KEY_UNINSTALL} Publisher "{{{registryPublisher}}}"
    WriteRegStr HKLM ${KEY_UNINSTALL} URLInfoAbout "{{{registryUrlInfoAbout}}}"
    WriteRegStr HKLM ${KEY_UNINSTALL} InstallLocation "$\"$INSTDIR$\""
    WriteRegStr HKLM ${KEY_UNINSTALL} UninstallString "$\"$INSTDIR\uninstall.exe$\""
    WriteRegStr HKLM ${KEY_UNINSTALL} QuietUninstallString "$\"$INSTDIR\uninstall.exe$\" /S"
    WriteRegDWORD HKLM ${KEY_UNINSTALL} NoModify 1
    WriteRegDWORD HKLM ${KEY_UNINSTALL} NoRepair 1
SectionEnd

Section "uninstall"
    SetRegView 64

    retryUninstall:
    FindWindow $0 "MozillaWindowClass"
    StrCmp $0 0 continueUninstall
        MessageBox MB_ABORTRETRYIGNORE|MB_ICONEXCLAMATION \
                $(MSG__FIREFOX_OPEN) \
                IDABORT abortUninstall \
                IDRETRY retryUninstall

            ExecWait "taskkill /f /im firefox.exe /t"
            Goto continueUninstall

        abortUninstall:
        Abort

    continueUninstall:

    ExecWait "taskkill /f /im '{{executableName}}'"

    # Remove uninstaller
    Delete "$INSTDIR\uninstall.exe"
    DeleteRegKey HKLM ${KEY_UNINSTALL}

    # Remove manifest and executable dir
    DeleteRegKey HKLM ${KEY_MANIFEST}
    Delete "$INSTDIR\{{executableName}}"
    Delete "$INSTDIR\{{bindingName}}"
    Delete "$INSTDIR\{{manifestName}}"
    RMDir $INSTDIR
SectionEnd
