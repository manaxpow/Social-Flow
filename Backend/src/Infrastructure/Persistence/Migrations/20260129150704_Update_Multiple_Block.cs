using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Update_Multiple_Block : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionUserId",
                table: "Friendships");

            migrationBuilder.AddColumn<bool>(
                name: "IsBlockedByUser1",
                table: "Friendships",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsBlockedByUser2",
                table: "Friendships",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBlockedByUser1",
                table: "Friendships");

            migrationBuilder.DropColumn(
                name: "IsBlockedByUser2",
                table: "Friendships");

            migrationBuilder.AddColumn<Guid>(
                name: "ActionUserId",
                table: "Friendships",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }
    }
}
