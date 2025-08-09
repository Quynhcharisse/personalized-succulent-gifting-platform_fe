import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";
import {Outlet} from "react-router-dom";

export default function WebApplicationLayout() {
    return (
        <div className={'base-layout'}>
            <SiteHeader/>
            <div className={'base-outlet'}>
                <Outlet/>
            </div>
            <SiteFooter/>
        </div>
    );
}
