// @refresh reload
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
  Link,
} from "solid-start";

import { SessionProvider } from "~/lib/session";

// https://realworld-docs.netlify.app/docs/specs/frontend-specs/styles

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Conduit</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Ionicon icons & Google Fonts the Bootstrap theme relies on */}
        <Link
          href="//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css"
          rel="stylesheet"
          type="text/css"
        />
        <Link
          href="//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic"
          rel="stylesheet"
          type="text/css"
        />
        {/* Custom Bootstrap 4 theme */}
        <Link rel="stylesheet" href="//demo.productionready.io/main.css" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <SessionProvider>
              <Routes>
                <FileRoutes />
              </Routes>
            </SessionProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
