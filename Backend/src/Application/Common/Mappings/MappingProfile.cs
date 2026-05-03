using System.Reflection;
using System.Runtime.CompilerServices;
using AutoMapper;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        ApplyMappingsFromAssembly(Assembly.GetExecutingAssembly());
    }

    private void ApplyMappingsFromAssembly(Assembly assembly)
    {
        var types = assembly.GetExportedTypes()
        .Where(t => t.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IMapFrom<>)));

        foreach (var type in types)
        {
            var instance = RuntimeHelpers.GetUninitializedObject(type);

            var methodInfo = type.GetMethod("Mapping")
                         ?? type.GetInterface("IMapFrom`1")?.GetMethod("Mapping");

            methodInfo?.Invoke(instance, new object[] { this });
        }
    }
}