# Current project structure

```text
grozo/
  apps/
    android/                        complete shared Android Studio workspace
      settings.gradle.kts
      build.gradle.kts
      gradle.properties
      gradlew / gradlew.bat
      gradle/wrapper/               official wrapper + pinned distribution checksum
      gradle/verification-metadata.xml
      customer/                     customer app, manifest, resources, lock and Kotlin source
      rider/                        partner app, manifest, resources, lock and Kotlin source
      core/                         models, theme/components, Room, Hilt, API, repository, ViewModel and tests
    web/                            React customer source, Vite config and public notices
    admin/                          React admin source, Vite config and public notices
  packages/
    domain/src/                     PRESERVED Stage 1 money/order rules
    client/src/                     typed development state and fail-closed HTTP adapter
    ui/src/                         shared accessible React controls, original drawings and Tailwind/CSS
    fixtures/catalog.json           SYNTHETIC_DEVELOPMENT_ONLY catalogue
    contracts/openapi.json          PRESERVED Stage 1 design contract
  database/                         PRESERVED SQL draft and reference seed
  assets/brand/                     PRESERVED original logo/tokens
  docs/
    decisions/                      foundation and Stage 2 decisions
    history/                        original Stage 1 status/readme/validation text
    licenses/                       dependency declarations and notices
    stage-2-build.md
    stage-2-features.md
    setup.md / status.md / validation.md
  reports/                          browser, APK, unit-test and audit evidence
    screenshots/                    actual desktop/phone browser captures
  tests/                            original tests + repository/API/UI workflow tests
  scripts/                          checks, build, notice collection and packaging
  services/{api,worker}/             still NOT_IMPLEMENTED destinations
  infra/                            still NOT_IMPLEMENTED destination
  .env.example / .npmrc / .gitignore
  package.json / pnpm-workspace.yaml / pnpm-lock.yaml / tsconfig.json
```

Local .toolchains, .cache, node_modules, Android/web build outputs, local.properties and private keystores are excluded from source packaging. The separately delivered debug APKs are real build artifacts; destination README files for the backend/worker remain honest implementation boundaries.

## Stage 3 additions

apps/web/src/catalogue.tsx; apps/admin/src/catalogue-manager.tsx; packages/client/src/catalogue.ts; packages/ui/src/product-media.tsx and stage3.css; native CatalogueScreen.kt and CatalogueQuery.kt; migration 0002_catalogue_media.sql and catalogue-stage3.openapi.json. Current evidence uses reports/stage3-*; source reconciliation/photography is pending as documented.
