using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VacationOptimizer.Server.Migrations.__TempPendingCheck
{
    /// <inheritdoc />
    public partial class __TempPendingCheck : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Holidays_CountryId",
                table: "Holidays");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Holidays_CountryId",
                table: "Holidays",
                column: "CountryId");
        }
    }
}
