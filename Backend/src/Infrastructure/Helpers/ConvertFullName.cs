public class ConvertFullName
{
    public static string ToFullName(string firstName, string lastName)
    {
        return $"{firstName} {lastName}".Trim();
    }
}