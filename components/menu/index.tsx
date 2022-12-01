import { useRouter } from "next/router";
import { MenuTypes, MenuType } from "./types";
import dynamic from "next/dynamic";

const Menus: MenuTypes = {
  "/": dynamic(() => import("./admin")),
  "/admin": dynamic(() => import("./admin")),
  "/admin/global-settings": dynamic(() => import("./admin")),
  "/admin/game": dynamic(() => import("./admin")),
  "/admin/games": dynamic(() => import("./admin")),
  "/unauthorized": dynamic(() => import("./admin")),
  "/game/[title]": dynamic(() => import("./admin")),
  "/404": dynamic(() => import("./admin")),
};
const DefaultMenu = ({ toggle }: MenuType) => {
  return <></>;
};
export default function Menu({ toggle }: MenuType) {
  const router = useRouter();
  const Menu = Menus.hasOwnProperty(router.pathname)
    ? Menus[router.pathname]
    : DefaultMenu;

  return <Menu toggle={toggle} />;
}
