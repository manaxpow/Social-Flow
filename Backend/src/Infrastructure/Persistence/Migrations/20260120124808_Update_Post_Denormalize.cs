using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update_Post_Denormalize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Comments",
                newName: "Content");

            migrationBuilder.AddColumn<int>(
                name: "CommentCount",
                table: "Posts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReactionCount",
                table: "Posts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TopComments",
                table: "Posts",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TopReactTypes",
                table: "Posts",
                type: "jsonb",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommentCount",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "ReactionCount",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "TopComments",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "TopReactTypes",
                table: "Posts");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "Comments",
                newName: "Description");
        }
    }
}
