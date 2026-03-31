namespace Jobify.Api.Helpers;

public static class ApplicationStatusHelper
{
    public static bool IsKnownStatus(string status)
    {
        return status switch
        {
            "Draft" => true,
            "Submitted" => true,
            "InReview" => true,
            "Shortlisted" => true,
            "InterviewScheduled" => true,
            "Accepted" => true,
            "Rejected" => true,
            "Withdrawn" => true,
            _ => false
        };
    }

    public static bool IsValidTransition(string from, string to)
    {
        if (!IsKnownStatus(from) || !IsKnownStatus(to))
            return false;

        if (from == to)
            return true;

        return from switch
        {
            "Draft" => to is "Submitted" or "Withdrawn",

            "Submitted" => to is "InReview" or "Withdrawn",

            "InReview" => to is "Shortlisted" or "Rejected" or "Withdrawn",

            "Shortlisted" => to is "InterviewScheduled" or "Rejected" or "Withdrawn",

            "InterviewScheduled" => to is "Accepted" or "Rejected" or "Withdrawn",

            "Accepted" => false,
            "Rejected" => false,
            "Withdrawn" => false,

            _ => false
        };
    }
}
