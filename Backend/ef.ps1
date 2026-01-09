param(
    [Parameter(Mandatory=$false)]
    [string]$add,
    
    [Switch]$up,
    
    [Switch]$remove
)

$infra = "Infrastructure/Infrastructure.csproj"
$api = "Api/Api.csproj"
$out = "Persistence/Migrations"

if ($add) {
    dotnet ef migrations add $add --project $infra --startup-project $api --output-dir $out
}
elseif ($up) {
    dotnet ef database update --project $infra --startup-project $api
}
elseif ($remove) {
    dotnet ef migrations remove --project $infra --startup-project $api
}
else {
    Write-Host "Cach dung:" -ForegroundColor Yellow
    Write-Host "  .\ef -add TenMigration"
    Write-Host "  .\ef -up"
    Write-Host "  .\ef -remove"
}