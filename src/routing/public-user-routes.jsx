import { Route, Routes } from "react-router-dom";
import { publicUser } from "../globals/route-names";
import Home18Page from "../app/pannels/public-user/components/home/index18";
import CandidateDetail from "../app/pannels/public-user/components/candidate/candidate-detail";

function PublicUserRoutes() {
    return (
        <Routes>
            <Route path={publicUser.INITIAL} element={<Home18Page />} />
            <Route path={publicUser.HOME18} element={<Home18Page />} />
            <Route path={publicUser.candidate.DETAIL1} element={<CandidateDetail />} />
            <Route path={publicUser.candidate.DETAIL2} element={<CandidateDetail />} />
            <Route path="/can-detail/:id" element={<CandidateDetail />} />
            <Route path="*" element={<Home18Page />} />
        </Routes>
    )
}

export default PublicUserRoutes;
