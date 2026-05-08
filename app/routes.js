//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

import govukPrototypeKit from "govuk-prototype-kit";
import {applyAzureHostingFix} from "./azure-hosting-fix.js";

applyAzureHostingFix();

const router = govukPrototypeKit.requests.setupRouter();

