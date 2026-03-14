using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VacationOptimizer.Server.Migrations
{
    public partial class AddOptionalHolidayState : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "States",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "States"
                SET "Code" = CONCAT('STATE-', "Id")
                WHERE "Code" IS NULL;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "States",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(16)",
                oldMaxLength: 16,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CountryId",
                table: "Holidays",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE "Holidays" AS h
                SET "CountryId" = s."CountryId"
                FROM "States" AS s
                WHERE h."StateId" = s."Id";
                """);

            migrationBuilder.AlterColumn<int>(
                name: "CountryId",
                table: "Holidays",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.DropForeignKey(
                name: "FK_Holidays_States_StateId",
                table: "Holidays");

            migrationBuilder.AlterColumn<int>(
                name: "StateId",
                table: "Holidays",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.UpdateData(
                table: "States",
                keyColumn: "Id",
                keyValue: 1,
                column: "Code",
                value: "AT-9");

            migrationBuilder.UpdateData(
                table: "States",
                keyColumn: "Id",
                keyValue: 2,
                column: "Code",
                value: "DE-BY");

            migrationBuilder.UpdateData(
                table: "States",
                keyColumn: "Id",
                keyValue: 3,
                column: "Code",
                value: "US-CA");

            migrationBuilder.InsertData(
                table: "Holidays",
                columns: new[] { "Id", "CountryId", "Date", "Name", "StateId" },
                values: new object[,]
                {
                    { 1, 1, new DateOnly(2026, 1, 1), "New Year's Day", null },
                    { 2, 2, new DateOnly(2026, 1, 6), "Epiphany", 2 },
                    { 3, 3, new DateOnly(2026, 1, 1), "New Year's Day", null },
                    { 4, 3, new DateOnly(2026, 3, 31), "Cesar Chavez Day", 3 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Countries_IsoCode",
                table: "Countries",
                column: "IsoCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Holidays_CountryId",
                table: "Holidays",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_States_CountryId_Code",
                table: "States",
                columns: new[] { "CountryId", "Code" },
                unique: true);

            migrationBuilder.Sql("""
                CREATE UNIQUE INDEX "IX_Holidays_CountryId_Date_StateId"
                ON "Holidays" ("CountryId", "Date", "StateId") NULLS NOT DISTINCT;
                """);

            migrationBuilder.AddForeignKey(
                name: "FK_Holidays_Countries_CountryId",
                table: "Holidays",
                column: "CountryId",
                principalTable: "Countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Holidays_States_StateId",
                table: "Holidays",
                column: "StateId",
                principalTable: "States",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Holidays_Countries_CountryId",
                table: "Holidays");

            migrationBuilder.DropForeignKey(
                name: "FK_Holidays_States_StateId",
                table: "Holidays");

            migrationBuilder.Sql("""
                DROP INDEX IF EXISTS "IX_Holidays_CountryId_Date_StateId";
                """);

            migrationBuilder.DropIndex(
                name: "IX_Countries_IsoCode",
                table: "Countries");

            migrationBuilder.DropIndex(
                name: "IX_Holidays_CountryId",
                table: "Holidays");

            migrationBuilder.DropIndex(
                name: "IX_States_CountryId_Code",
                table: "States");

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "CountryId",
                table: "Holidays");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "States");

            migrationBuilder.AlterColumn<int>(
                name: "StateId",
                table: "Holidays",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "Holidays",
                columns: new[] { "Id", "Date", "Name", "StateId" },
                values: new object[,]
                {
                    { 1, new DateOnly(2026, 1, 1), "New Year's Day", 1 },
                    { 2, new DateOnly(2026, 1, 1), "New Year's Day", 2 },
                    { 3, new DateOnly(2026, 1, 1), "New Year's Day", 3 }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Holidays_States_StateId",
                table: "Holidays",
                column: "StateId",
                principalTable: "States",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
