import type { VoidComponent } from "solid-js";
import { Outlet } from "solid-start";

import Header from "~/components/common/Header";
import Footer from "~/components/common/Footer";

const MainLayout: VoidComponent = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

export default MainLayout;
