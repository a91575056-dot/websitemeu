import { reviewStore, cleanupReviewLimits } from './lib/reviews-core.mjs';
import { analyticsStore, cleanupAnalytics } from './lib/analytics-core.mjs';
export default async function cleanup(request,context){if(context?.deploy?.published){await cleanupAnalytics(analyticsStore(context));await cleanupReviewLimits(reviewStore(context));}return new Response(null,{status:204});}
export const config={schedule:'17 3 * * *'};
