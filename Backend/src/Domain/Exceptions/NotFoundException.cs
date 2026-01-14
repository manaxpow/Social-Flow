public class NotFoundException(string entityName, string key)
: AppException($"{entityName} with key {key} was not found.", 404)
{
}