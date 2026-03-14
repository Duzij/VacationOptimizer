using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VacationOptimizer.Server.Migrations
{
    /// <inheritdoc />
    public partial class IndiaSeedAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Countries",
                columns: new[] { "Id", "IsoCode", "Name" },
                values: new object[] { 4, "IN", "India" });

            migrationBuilder.InsertData(
                table: "States",
                columns: new[] { "Id", "Code", "CountryId", "Name" },
                values: new object[,]
                {
                    { 4, "IN-AP", 4, "Andhra Pradesh" },
                    { 5, "IN-AR", 4, "Arunāchal Pradesh" },
                    { 6, "IN-AS", 4, "Assam" },
                    { 7, "IN-BR", 4, "Bihār" },
                    { 8, "IN-CG", 4, "Chhattīsgarh" },
                    { 9, "IN-GA", 4, "Goa" },
                    { 10, "IN-GJ", 4, "Gujarāt" },
                    { 11, "IN-HR", 4, "Haryāna" },
                    { 12, "IN-HP", 4, "Himāchal Pradesh" },
                    { 13, "IN-JH", 4, "Jhārkhand" },
                    { 14, "IN-KA", 4, "Karnātaka" },
                    { 15, "IN-KL", 4, "Kerala" },
                    { 16, "IN-MP", 4, "Madhya Pradesh" },
                    { 17, "IN-MH", 4, "Mahārāshtra" },
                    { 18, "IN-MN", 4, "Manipur" },
                    { 19, "IN-ML", 4, "Meghālaya" },
                    { 20, "IN-MZ", 4, "Mizoram" },
                    { 21, "IN-NL", 4, "Nāgāland" },
                    { 22, "IN-OD", 4, "Odisha" },
                    { 23, "IN-PB", 4, "Punjab" },
                    { 24, "IN-RJ", 4, "Rājasthān" },
                    { 25, "IN-SK", 4, "Sikkim" },
                    { 26, "IN-TN", 4, "Tamil Nādu" },
                    { 27, "IN-TS", 4, "Telangāna" },
                    { 28, "IN-TR", 4, "Tripura" },
                    { 29, "IN-UP", 4, "Uttar Pradesh" },
                    { 30, "IN-UK", 4, "Uttarākhand" },
                    { 31, "IN-WB", 4, "West Bengal" },
                    { 32, "IN-TS-HY", 4, "Telangāna (Hyderabad)" },
                    { 33, "IN-WB-KL", 4, "West Bengal (Kolkata)" }
                });

            migrationBuilder.InsertData(
                table: "Holidays",
                columns: new[] { "Id", "CountryId", "Date", "Name", "StateId" },
                values: new object[,]
                {
                    { 5, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 5 },
                    { 6, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 19 },
                    { 7, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 18 },
                    { 8, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 20 },
                    { 9, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 21 },
                    { 10, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 24 },
                    { 11, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 25 },
                    { 12, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 27 },
                    { 13, 4, new DateOnly(2026, 1, 1), "New Year’s Day", 26 },
                    { 14, 4, new DateOnly(2026, 1, 3), "Hazarat Ali’s Birthday", 29 },
                    { 15, 4, new DateOnly(2026, 1, 14), "Pongal", 4 },
                    { 16, 4, new DateOnly(2026, 1, 14), "Pongal", 5 },
                    { 17, 4, new DateOnly(2026, 1, 14), "Pongal", 26 },
                    { 18, 4, new DateOnly(2026, 1, 14), "Makara Sankranti", 10 },
                    { 19, 4, new DateOnly(2026, 1, 14), "Makara Sankranti", 14 },
                    { 20, 4, new DateOnly(2026, 1, 14), "Makara Sankranti", 27 },
                    { 21, 4, new DateOnly(2026, 1, 14), "Makara Sankranti", 25 },
                    { 22, 4, new DateOnly(2026, 1, 23), "Vasant Panchami", 11 },
                    { 23, 4, new DateOnly(2026, 1, 23), "Vasant Panchami", 22 },
                    { 24, 4, new DateOnly(2026, 1, 23), "Vasant Panchami", 28 },
                    { 25, 4, new DateOnly(2026, 1, 23), "Vasant Panchami", 31 },
                    { 26, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 4 },
                    { 27, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 5 },
                    { 28, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 6 },
                    { 29, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 7 },
                    { 30, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 8 },
                    { 31, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 9 },
                    { 32, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 10 },
                    { 33, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 11 },
                    { 34, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 12 },
                    { 35, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 13 },
                    { 36, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 14 },
                    { 37, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 15 },
                    { 38, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 16 },
                    { 39, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 17 },
                    { 40, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 18 },
                    { 41, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 19 },
                    { 42, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 20 },
                    { 43, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 21 },
                    { 44, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 22 },
                    { 45, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 23 },
                    { 46, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 24 },
                    { 47, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 25 },
                    { 48, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 26 },
                    { 49, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 27 },
                    { 50, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 28 },
                    { 51, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 29 },
                    { 52, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 30 },
                    { 53, 4, new DateOnly(2026, 1, 26), "Republic Day (National)", 31 },
                    { 54, 4, new DateOnly(2026, 2, 1), "Guru Ravidas Jayanti", 12 },
                    { 55, 4, new DateOnly(2026, 2, 1), "Guru Ravidas Jayanti", 11 },
                    { 56, 4, new DateOnly(2026, 2, 1), "Guru Ravidas Jayanti", 16 },
                    { 57, 4, new DateOnly(2026, 2, 1), "Guru Ravidas Jayanti", 23 },
                    { 58, 4, new DateOnly(2026, 2, 12), "Maharshi Dayanand Saraswati Jayanti", 10 },
                    { 59, 4, new DateOnly(2026, 2, 12), "Maharshi Dayanand Saraswati Jayanti", 24 },
                    { 60, 4, new DateOnly(2026, 2, 12), "Maharshi Dayanand Saraswati Jayanti", 11 },
                    { 61, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 4 },
                    { 62, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 8 },
                    { 63, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 10 },
                    { 64, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 11 },
                    { 65, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 12 },
                    { 66, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 13 },
                    { 67, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 14 },
                    { 68, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 15 },
                    { 69, 4, new DateOnly(2026, 2, 15), "Maha Shivaratri", 16 },
                    { 70, 4, new DateOnly(2026, 2, 17), "Lunar New Year", 14 },
                    { 71, 4, new DateOnly(2026, 2, 17), "Lunar New Year", 4 },
                    { 72, 4, new DateOnly(2026, 2, 17), "Lunar New Year", 27 },
                    { 73, 4, new DateOnly(2026, 2, 17), "Lunar New Year", 15 },
                    { 74, 4, new DateOnly(2026, 2, 17), "Lunar New Year", 9 },
                    { 75, 4, new DateOnly(2026, 2, 17), "Lunar New Year", 17 },
                    { 76, 4, new DateOnly(2026, 2, 19), "Ramadan Start (Tentative Date)", 17 },
                    { 77, 4, new DateOnly(2026, 2, 19), "Ramadan Start (Tentative Date)", 27 },
                    { 78, 4, new DateOnly(2026, 2, 19), "Ramadan Start (Tentative Date)", 16 },
                    { 79, 4, new DateOnly(2026, 2, 19), "Ramadan Start (Tentative Date)", 10 },
                    { 80, 4, new DateOnly(2026, 3, 3), "Holika Dahana", 29 },
                    { 81, 4, new DateOnly(2026, 3, 3), "Holika Dahana", 24 },
                    { 82, 4, new DateOnly(2026, 3, 3), "Holika Dahana", 16 },
                    { 83, 4, new DateOnly(2026, 3, 4), "Holi", 4 },
                    { 84, 4, new DateOnly(2026, 3, 4), "Holi", 5 },
                    { 85, 4, new DateOnly(2026, 3, 4), "Holi", 6 },
                    { 86, 4, new DateOnly(2026, 3, 4), "Holi", 7 },
                    { 87, 4, new DateOnly(2026, 3, 4), "Holi", 8 },
                    { 88, 4, new DateOnly(2026, 3, 4), "Holi", 9 },
                    { 89, 4, new DateOnly(2026, 3, 4), "Holi", 10 },
                    { 90, 4, new DateOnly(2026, 3, 4), "Holi", 11 },
                    { 91, 4, new DateOnly(2026, 3, 4), "Holi", 12 },
                    { 92, 4, new DateOnly(2026, 3, 4), "Holi", 13 },
                    { 93, 4, new DateOnly(2026, 3, 4), "Holi", 16 },
                    { 94, 4, new DateOnly(2026, 3, 4), "Holi", 17 },
                    { 95, 4, new DateOnly(2026, 3, 4), "Holi", 19 },
                    { 96, 4, new DateOnly(2026, 3, 4), "Holi", 20 },
                    { 97, 4, new DateOnly(2026, 3, 4), "Holi", 21 },
                    { 98, 4, new DateOnly(2026, 3, 4), "Holi", 22 },
                    { 99, 4, new DateOnly(2026, 3, 4), "Holi", 23 },
                    { 100, 4, new DateOnly(2026, 3, 4), "Holi", 24 },
                    { 101, 4, new DateOnly(2026, 3, 4), "Holi", 25 },
                    { 102, 4, new DateOnly(2026, 3, 4), "Holi", 27 },
                    { 103, 4, new DateOnly(2026, 3, 4), "Holi", 28 },
                    { 104, 4, new DateOnly(2026, 3, 4), "Holi", 29 },
                    { 105, 4, new DateOnly(2026, 3, 4), "Holi", 30 },
                    { 106, 4, new DateOnly(2026, 3, 19), "Ugadi", 4 },
                    { 107, 4, new DateOnly(2026, 3, 19), "Ugadi", 9 },
                    { 108, 4, new DateOnly(2026, 3, 19), "Ugadi", 10 },
                    { 109, 4, new DateOnly(2026, 3, 19), "Ugadi", 14 },
                    { 110, 4, new DateOnly(2026, 3, 19), "Ugadi", 24 },
                    { 111, 4, new DateOnly(2026, 3, 19), "Ugadi", 27 },
                    { 112, 4, new DateOnly(2026, 3, 19), "Gudi Padwa", 17 },
                    { 113, 4, new DateOnly(2026, 3, 19), "Gudi Padwa", 16 },
                    { 114, 4, new DateOnly(2026, 3, 20), "March Equinox", 4 },
                    { 115, 4, new DateOnly(2026, 3, 20), "March Equinox", 9 },
                    { 116, 4, new DateOnly(2026, 3, 20), "March Equinox", 10 },
                    { 117, 4, new DateOnly(2026, 3, 20), "March Equinox", 14 },
                    { 118, 4, new DateOnly(2026, 3, 20), "March Equinox", 24 },
                    { 119, 4, new DateOnly(2026, 3, 20), "March Equinox", 27 },
                    { 120, 4, new DateOnly(2026, 3, 21), "Ramzan Id (Tentative Date)", 17 },
                    { 121, 4, new DateOnly(2026, 3, 21), "Ramzan Id (Tentative Date)", 27 },
                    { 122, 4, new DateOnly(2026, 3, 21), "Ramzan Id (Tentative Date)", 16 },
                    { 123, 4, new DateOnly(2026, 3, 21), "Ramzan Id (Tentative Date)", 10 },
                    { 124, 4, new DateOnly(2026, 3, 26), "Rama Navami", 4 },
                    { 125, 4, new DateOnly(2026, 3, 26), "Rama Navami", 7 },
                    { 126, 4, new DateOnly(2026, 3, 26), "Rama Navami", 8 },
                    { 127, 4, new DateOnly(2026, 3, 26), "Rama Navami", 10 },
                    { 128, 4, new DateOnly(2026, 3, 26), "Rama Navami", 11 },
                    { 129, 4, new DateOnly(2026, 3, 26), "Rama Navami", 12 },
                    { 130, 4, new DateOnly(2026, 3, 26), "Rama Navami", 16 },
                    { 131, 4, new DateOnly(2026, 3, 26), "Rama Navami", 17 },
                    { 132, 4, new DateOnly(2026, 3, 26), "Rama Navami", 22 },
                    { 133, 4, new DateOnly(2026, 3, 26), "Rama Navami", 23 },
                    { 134, 4, new DateOnly(2026, 3, 26), "Rama Navami", 24 },
                    { 135, 4, new DateOnly(2026, 3, 26), "Rama Navami", 25 },
                    { 136, 4, new DateOnly(2026, 3, 26), "Rama Navami", 27 },
                    { 137, 4, new DateOnly(2026, 3, 26), "Rama Navami", 29 },
                    { 138, 4, new DateOnly(2026, 3, 26), "Rama Navami", 30 },
                    { 139, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 8 },
                    { 140, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 10 },
                    { 141, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 11 },
                    { 142, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 13 },
                    { 143, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 14 },
                    { 144, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 17 },
                    { 145, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 16 },
                    { 146, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 20 },
                    { 147, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 22 },
                    { 148, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 23 },
                    { 149, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 24 },
                    { 150, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 26 },
                    { 151, 4, new DateOnly(2026, 3, 31), "Mahavir Jayanti", 29 },
                    { 152, 4, new DateOnly(2026, 4, 2), "First Day of Passover", 17 },
                    { 153, 4, new DateOnly(2026, 4, 2), "Maundy Thursday", 15 },
                    { 154, 4, new DateOnly(2026, 4, 3), "Good Friday", 4 },
                    { 155, 4, new DateOnly(2026, 4, 3), "Good Friday", 5 },
                    { 156, 4, new DateOnly(2026, 4, 3), "Good Friday", 6 },
                    { 157, 4, new DateOnly(2026, 4, 3), "Good Friday", 7 },
                    { 158, 4, new DateOnly(2026, 4, 3), "Good Friday", 8 },
                    { 159, 4, new DateOnly(2026, 4, 3), "Good Friday", 9 },
                    { 160, 4, new DateOnly(2026, 4, 3), "Good Friday", 10 },
                    { 161, 4, new DateOnly(2026, 4, 3), "Good Friday", 12 },
                    { 162, 4, new DateOnly(2026, 4, 3), "Good Friday", 13 },
                    { 163, 4, new DateOnly(2026, 4, 3), "Good Friday", 14 },
                    { 164, 4, new DateOnly(2026, 4, 3), "Good Friday", 15 },
                    { 165, 4, new DateOnly(2026, 4, 3), "Good Friday", 16 },
                    { 166, 4, new DateOnly(2026, 4, 3), "Good Friday", 17 },
                    { 167, 4, new DateOnly(2026, 4, 3), "Good Friday", 18 },
                    { 168, 4, new DateOnly(2026, 4, 3), "Good Friday", 19 },
                    { 169, 4, new DateOnly(2026, 4, 3), "Good Friday", 20 },
                    { 170, 4, new DateOnly(2026, 4, 3), "Good Friday", 21 },
                    { 171, 4, new DateOnly(2026, 4, 3), "Good Friday", 22 },
                    { 172, 4, new DateOnly(2026, 4, 3), "Good Friday", 23 },
                    { 173, 4, new DateOnly(2026, 4, 3), "Good Friday", 24 },
                    { 174, 4, new DateOnly(2026, 4, 3), "Good Friday", 25 },
                    { 175, 4, new DateOnly(2026, 4, 3), "Good Friday", 26 },
                    { 176, 4, new DateOnly(2026, 4, 3), "Good Friday", 27 },
                    { 177, 4, new DateOnly(2026, 4, 3), "Good Friday", 28 },
                    { 178, 4, new DateOnly(2026, 4, 3), "Good Friday", 29 },
                    { 179, 4, new DateOnly(2026, 4, 3), "Good Friday", 30 },
                    { 180, 4, new DateOnly(2026, 4, 3), "Good Friday", 31 },
                    { 181, 4, new DateOnly(2026, 4, 5), "Easter Day", 15 },
                    { 182, 4, new DateOnly(2026, 4, 5), "Easter Day", 21 },
                    { 183, 4, new DateOnly(2026, 4, 14), "Vaisakhi", 23 },
                    { 184, 4, new DateOnly(2026, 4, 14), "Ambedkar Jayanti", 28 },
                    { 185, 4, new DateOnly(2026, 4, 14), "Ambedkar Jayanti", 31 },
                    { 186, 4, new DateOnly(2026, 4, 15), "Bahag Bihu/Vaisakhadi", 14 },
                    { 187, 4, new DateOnly(2026, 4, 15), "Bahag Bihu/Vaisakhadi", 17 },
                    { 188, 4, new DateOnly(2026, 5, 1), "International Workers Day", 14 },
                    { 189, 4, new DateOnly(2026, 5, 1), "International Workers Day", 17 },
                    { 190, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 5 },
                    { 191, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 6 },
                    { 192, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 8 },
                    { 193, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 12 },
                    { 194, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 13 },
                    { 195, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 16 },
                    { 196, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 20 },
                    { 197, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 22 },
                    { 198, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 28 },
                    { 199, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 30 },
                    { 200, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 29 },
                    { 201, 4, new DateOnly(2026, 5, 1), "Buddha Purnima/Vaisakhadi", 31 },
                    { 202, 4, new DateOnly(2026, 5, 9), "Birthday of Rabindranath", 28 },
                    { 203, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 4 },
                    { 204, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 6 },
                    { 205, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 7 },
                    { 206, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 8 },
                    { 207, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 9 },
                    { 208, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 10 },
                    { 209, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 11 },
                    { 210, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 12 },
                    { 211, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 13 },
                    { 212, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 14 },
                    { 213, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 15 },
                    { 214, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 16 },
                    { 215, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 17 },
                    { 216, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 18 },
                    { 217, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 19 },
                    { 218, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 20 },
                    { 219, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 21 },
                    { 220, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 22 },
                    { 221, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 23 },
                    { 222, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 24 },
                    { 223, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 26 },
                    { 224, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 27 },
                    { 225, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 28 },
                    { 226, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 29 },
                    { 227, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 30 },
                    { 228, 4, new DateOnly(2026, 5, 27), "Bakrid (Tentative Date)", 31 },
                    { 229, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 4 },
                    { 230, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 7 },
                    { 231, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 10 },
                    { 232, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 12 },
                    { 233, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 13 },
                    { 234, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 14 },
                    { 235, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 16 },
                    { 236, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 17 },
                    { 237, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 20 },
                    { 238, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 22 },
                    { 239, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 24 },
                    { 240, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 26 },
                    { 241, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 27 },
                    { 242, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 28 },
                    { 243, 4, new DateOnly(2026, 6, 26), "Muharram/Ashura (Tentative Date)", 29 },
                    { 244, 4, new DateOnly(2026, 7, 16), "Rath Yatra", 22 },
                    { 245, 4, new DateOnly(2026, 8, 2), "Friendship Day", 14 },
                    { 246, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 4 },
                    { 247, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 5 },
                    { 248, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 6 },
                    { 249, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 7 },
                    { 250, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 8 },
                    { 251, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 9 },
                    { 252, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 10 },
                    { 253, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 11 },
                    { 254, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 12 },
                    { 255, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 13 },
                    { 256, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 14 },
                    { 257, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 15 },
                    { 258, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 16 },
                    { 259, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 17 },
                    { 260, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 18 },
                    { 261, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 19 },
                    { 262, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 20 },
                    { 263, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 21 },
                    { 264, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 22 },
                    { 265, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 23 },
                    { 266, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 24 },
                    { 267, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 25 },
                    { 268, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 26 },
                    { 269, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 27 },
                    { 270, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 28 },
                    { 271, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 29 },
                    { 272, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 30 },
                    { 273, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 31 },
                    { 274, 4, new DateOnly(2026, 8, 15), "Independence Day (National)", 32 },
                    { 275, 4, new DateOnly(2026, 8, 26), "Onam", 15 },
                    { 276, 4, new DateOnly(2026, 8, 28), "Raksha Bandhan", 8 },
                    { 277, 4, new DateOnly(2026, 8, 28), "Raksha Bandhan", 10 },
                    { 278, 4, new DateOnly(2026, 8, 28), "Raksha Bandhan", 11 },
                    { 279, 4, new DateOnly(2026, 8, 28), "Raksha Bandhan", 16 },
                    { 280, 4, new DateOnly(2026, 8, 28), "Raksha Bandhan", 24 },
                    { 281, 4, new DateOnly(2026, 8, 28), "Raksha Bandhan", 30 },
                    { 282, 4, new DateOnly(2026, 8, 28), "Raksha Bandhan", 29 },
                    { 283, 4, new DateOnly(2026, 9, 4), "Janmashtami", 4 },
                    { 284, 4, new DateOnly(2026, 9, 4), "Janmashtami", 7 },
                    { 285, 4, new DateOnly(2026, 9, 4), "Janmashtami", 8 },
                    { 286, 4, new DateOnly(2026, 9, 4), "Janmashtami", 10 },
                    { 287, 4, new DateOnly(2026, 9, 4), "Janmashtami", 11 },
                    { 288, 4, new DateOnly(2026, 9, 4), "Janmashtami", 12 },
                    { 289, 4, new DateOnly(2026, 9, 4), "Janmashtami", 13 },
                    { 290, 4, new DateOnly(2026, 9, 4), "Janmashtami", 16 },
                    { 291, 4, new DateOnly(2026, 9, 4), "Janmashtami", 18 },
                    { 292, 4, new DateOnly(2026, 9, 4), "Janmashtami", 19 },
                    { 293, 4, new DateOnly(2026, 9, 4), "Janmashtami", 21 },
                    { 294, 4, new DateOnly(2026, 9, 4), "Janmashtami", 22 },
                    { 295, 4, new DateOnly(2026, 9, 4), "Janmashtami", 23 },
                    { 296, 4, new DateOnly(2026, 9, 4), "Janmashtami", 24 },
                    { 297, 4, new DateOnly(2026, 9, 4), "Janmashtami", 25 },
                    { 298, 4, new DateOnly(2026, 9, 4), "Janmashtami", 26 },
                    { 299, 4, new DateOnly(2026, 9, 4), "Janmashtami", 27 },
                    { 300, 4, new DateOnly(2026, 9, 4), "Janmashtami", 28 },
                    { 301, 4, new DateOnly(2026, 9, 4), "Janmashtami", 29 },
                    { 302, 4, new DateOnly(2026, 9, 4), "Janmashtami", 30 },
                    { 303, 4, new DateOnly(2026, 9, 14), "Ganesh Chaturthi", 4 },
                    { 304, 4, new DateOnly(2026, 9, 14), "Ganesh Chaturthi", 9 },
                    { 305, 4, new DateOnly(2026, 9, 14), "Ganesh Chaturthi", 10 },
                    { 306, 4, new DateOnly(2026, 9, 14), "Ganesh Chaturthi", 14 },
                    { 307, 4, new DateOnly(2026, 9, 14), "Ganesh Chaturthi", 17 },
                    { 308, 4, new DateOnly(2026, 9, 14), "Ganesh Chaturthi", 27 },
                    { 309, 4, new DateOnly(2026, 9, 14), "Ganesh Chaturthi", 26 },
                    { 310, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 4 },
                    { 311, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 5 },
                    { 312, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 6 },
                    { 313, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 7 },
                    { 314, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 8 },
                    { 315, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 9 },
                    { 316, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 10 },
                    { 317, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 11 },
                    { 318, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 12 },
                    { 319, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 13 },
                    { 320, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 14 },
                    { 321, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 15 },
                    { 322, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 16 },
                    { 323, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 17 },
                    { 324, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 18 },
                    { 325, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 19 },
                    { 326, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 20 },
                    { 327, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 21 },
                    { 328, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 22 },
                    { 329, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 23 },
                    { 330, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 24 },
                    { 331, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 25 },
                    { 332, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 26 },
                    { 333, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 27 },
                    { 334, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 28 },
                    { 335, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 29 },
                    { 336, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 30 },
                    { 337, 4, new DateOnly(2026, 10, 2), "Mahatma Gandhi Jayanti (National)", 31 },
                    { 338, 4, new DateOnly(2026, 10, 11), "First Day of Sharad Navratri", 10 },
                    { 339, 4, new DateOnly(2026, 10, 11), "First Day of Sharad Navratri", 17 },
                    { 340, 4, new DateOnly(2026, 10, 17), "First Day of Durga Puja Festivities", 22 },
                    { 341, 4, new DateOnly(2026, 10, 17), "First Day of Durga Puja Festivities", 6 },
                    { 342, 4, new DateOnly(2026, 10, 17), "First Day of Durga Puja Festivities", 28 },
                    { 343, 4, new DateOnly(2026, 10, 18), "Maha Saptami", 19 },
                    { 344, 4, new DateOnly(2026, 10, 18), "Maha Saptami", 22 },
                    { 345, 4, new DateOnly(2026, 10, 18), "Maha Saptami", 25 },
                    { 346, 4, new DateOnly(2026, 10, 18), "Maha Saptami", 28 },
                    { 347, 4, new DateOnly(2026, 10, 18), "Maha Saptami", 31 },
                    { 348, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 4 },
                    { 349, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 5 },
                    { 350, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 13 },
                    { 351, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 19 },
                    { 352, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 18 },
                    { 353, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 22 },
                    { 354, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 24 },
                    { 355, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 25 },
                    { 356, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 27 },
                    { 357, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 28 },
                    { 358, 4, new DateOnly(2026, 10, 19), "Maha Ashtami", 31 },
                    { 359, 4, new DateOnly(2026, 10, 20), "Dussehra", 4 },
                    { 360, 4, new DateOnly(2026, 10, 20), "Dussehra", 5 },
                    { 361, 4, new DateOnly(2026, 10, 20), "Dussehra", 6 },
                    { 362, 4, new DateOnly(2026, 10, 20), "Dussehra", 7 },
                    { 363, 4, new DateOnly(2026, 10, 20), "Dussehra", 8 },
                    { 364, 4, new DateOnly(2026, 10, 20), "Dussehra", 9 },
                    { 365, 4, new DateOnly(2026, 10, 20), "Dussehra", 10 },
                    { 366, 4, new DateOnly(2026, 10, 20), "Dussehra", 11 },
                    { 367, 4, new DateOnly(2026, 10, 20), "Dussehra", 12 },
                    { 368, 4, new DateOnly(2026, 10, 20), "Dussehra", 13 },
                    { 369, 4, new DateOnly(2026, 10, 20), "Dussehra", 14 },
                    { 370, 4, new DateOnly(2026, 10, 20), "Dussehra", 15 },
                    { 371, 4, new DateOnly(2026, 10, 20), "Dussehra", 16 },
                    { 372, 4, new DateOnly(2026, 10, 20), "Dussehra", 17 },
                    { 373, 4, new DateOnly(2026, 10, 20), "Dussehra", 19 },
                    { 374, 4, new DateOnly(2026, 10, 20), "Dussehra", 20 },
                    { 375, 4, new DateOnly(2026, 10, 20), "Dussehra", 21 },
                    { 376, 4, new DateOnly(2026, 10, 20), "Dussehra", 22 },
                    { 377, 4, new DateOnly(2026, 10, 20), "Dussehra", 23 },
                    { 378, 4, new DateOnly(2026, 10, 20), "Dussehra", 24 },
                    { 379, 4, new DateOnly(2026, 10, 20), "Dussehra", 25 },
                    { 380, 4, new DateOnly(2026, 10, 20), "Dussehra", 26 },
                    { 381, 4, new DateOnly(2026, 10, 20), "Dussehra", 27 },
                    { 382, 4, new DateOnly(2026, 10, 20), "Dussehra", 28 },
                    { 383, 4, new DateOnly(2026, 10, 20), "Dussehra", 29 },
                    { 384, 4, new DateOnly(2026, 10, 20), "Dussehra", 30 },
                    { 385, 4, new DateOnly(2026, 10, 20), "Dussehra", 31 },
                    { 386, 4, new DateOnly(2026, 10, 26), "Maharshi Valmiki Jayanti", 12 },
                    { 387, 4, new DateOnly(2026, 10, 26), "Maharshi Valmiki Jayanti", 11 },
                    { 388, 4, new DateOnly(2026, 10, 26), "Maharshi Valmiki Jayanti", 14 },
                    { 389, 4, new DateOnly(2026, 10, 26), "Maharshi Valmiki Jayanti", 16 },
                    { 390, 4, new DateOnly(2026, 10, 26), "Maharshi Valmiki Jayanti", 23 },
                    { 391, 4, new DateOnly(2026, 10, 29), "Karaka Chaturthi (Karva Chauth)", 23 },
                    { 392, 4, new DateOnly(2026, 10, 29), "Karaka Chaturthi (Karva Chauth)", 12 },
                    { 393, 4, new DateOnly(2026, 10, 29), "Karaka Chaturthi (Karva Chauth)", 11 },
                    { 394, 4, new DateOnly(2026, 10, 29), "Karaka Chaturthi (Karva Chauth)", 29 },
                    { 395, 4, new DateOnly(2026, 10, 29), "Karaka Chaturthi (Karva Chauth)", 24 },
                    { 396, 4, new DateOnly(2026, 10, 31), "Halloween", 17 },
                    { 397, 4, new DateOnly(2026, 10, 31), "Halloween", 33 },
                    { 398, 4, new DateOnly(2026, 11, 8), "Naraka Chaturdashi", 4 },
                    { 399, 4, new DateOnly(2026, 11, 8), "Naraka Chaturdashi", 9 },
                    { 400, 4, new DateOnly(2026, 11, 8), "Naraka Chaturdashi", 14 },
                    { 401, 4, new DateOnly(2026, 11, 8), "Naraka Chaturdashi", 15 },
                    { 402, 4, new DateOnly(2026, 11, 8), "Naraka Chaturdashi", 27 },
                    { 403, 4, new DateOnly(2026, 11, 8), "Naraka Chaturdashi", 26 },
                    { 404, 4, new DateOnly(2026, 11, 9), "Govardhan Puja", 10 },
                    { 405, 4, new DateOnly(2026, 11, 9), "Govardhan Puja", 17 },
                    { 406, 4, new DateOnly(2026, 11, 9), "Govardhan Puja", 29 },
                    { 407, 4, new DateOnly(2026, 11, 9), "Govardhan Puja", 7 },
                    { 408, 4, new DateOnly(2026, 11, 9), "Govardhan Puja", 11 },
                    { 409, 4, new DateOnly(2026, 11, 9), "Govardhan Puja", 24 },
                    { 410, 4, new DateOnly(2026, 11, 11), "Bhai Dooj", 10 },
                    { 411, 4, new DateOnly(2026, 11, 11), "Bhai Dooj", 24 },
                    { 412, 4, new DateOnly(2026, 11, 11), "Bhai Dooj", 25 },
                    { 413, 4, new DateOnly(2026, 11, 11), "Bhai Dooj", 30 },
                    { 414, 4, new DateOnly(2026, 11, 11), "Bhai Dooj", 29 },
                    { 415, 4, new DateOnly(2026, 11, 15), "Chhat Puja", 6 },
                    { 416, 4, new DateOnly(2026, 11, 15), "Chhat Puja", 7 },
                    { 417, 4, new DateOnly(2026, 11, 15), "Chhat Puja", 8 },
                    { 418, 4, new DateOnly(2026, 11, 15), "Chhat Puja", 13 },
                    { 419, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 5 },
                    { 420, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 6 },
                    { 421, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 8 },
                    { 422, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 10 },
                    { 423, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 11 },
                    { 424, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 12 },
                    { 425, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 13 },
                    { 426, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 16 },
                    { 427, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 17 },
                    { 428, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 20 },
                    { 429, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 21 },
                    { 430, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 23 },
                    { 431, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 24 },
                    { 432, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 27 },
                    { 433, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 29 },
                    { 434, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 30 },
                    { 435, 4, new DateOnly(2026, 11, 24), "Guru Nanak Jayanti", 31 },
                    { 436, 4, new DateOnly(2026, 12, 5), "First Day of Hanukkah", 14 },
                    { 437, 4, new DateOnly(2026, 12, 5), "First Day of Hanukkah", 17 },
                    { 438, 4, new DateOnly(2026, 12, 5), "First Day of Hanukkah", 18 },
                    { 439, 4, new DateOnly(2026, 12, 12), "Last Day of Hanukkah", 14 },
                    { 440, 4, new DateOnly(2026, 12, 12), "Last Day of Hanukkah", 17 },
                    { 441, 4, new DateOnly(2026, 12, 12), "Last Day of Hanukkah", 18 },
                    { 442, 4, new DateOnly(2026, 12, 22), "December Solstice", 26 },
                    { 443, 4, new DateOnly(2026, 12, 22), "December Solstice", 4 },
                    { 444, 4, new DateOnly(2026, 12, 22), "December Solstice", 27 },
                    { 445, 4, new DateOnly(2026, 12, 22), "December Solstice", 14 },
                    { 446, 4, new DateOnly(2026, 12, 22), "December Solstice", 23 },
                    { 447, 4, new DateOnly(2026, 12, 23), "Hazarat Ali’s Birthday", 29 },
                    { 448, 4, new DateOnly(2026, 12, 24), "Christmas Eve", 19 },
                    { 449, 4, new DateOnly(2026, 12, 24), "Christmas Eve", 20 },
                    { 450, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 4 },
                    { 451, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 5 },
                    { 452, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 6 },
                    { 453, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 7 },
                    { 454, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 8 },
                    { 455, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 9 },
                    { 456, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 10 },
                    { 457, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 11 },
                    { 458, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 12 },
                    { 459, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 13 },
                    { 460, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 14 },
                    { 461, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 15 },
                    { 462, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 16 },
                    { 463, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 17 },
                    { 464, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 18 },
                    { 465, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 19 },
                    { 466, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 20 },
                    { 467, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 21 },
                    { 468, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 22 },
                    { 469, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 23 },
                    { 470, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 24 },
                    { 471, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 25 },
                    { 472, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 26 },
                    { 473, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 27 },
                    { 474, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 28 },
                    { 475, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 29 },
                    { 476, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 30 },
                    { 477, 4, new DateOnly(2026, 12, 25), "Christmas (National)", 31 },
                    { 478, 4, new DateOnly(2026, 12, 31), "New Year’s Eve", 18 },
                    { 479, 4, new DateOnly(2026, 12, 31), "New Year’s Eve", 20 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 60);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 61);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 62);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 63);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 64);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 65);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 66);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 67);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 68);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 69);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 70);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 71);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 72);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 73);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 74);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 75);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 76);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 77);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 78);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 79);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 80);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 81);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 82);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 83);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 84);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 85);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 86);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 87);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 88);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 89);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 90);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 91);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 92);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 93);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 94);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 95);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 96);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 97);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 98);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 99);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 100);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 101);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 102);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 103);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 104);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 105);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 106);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 107);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 108);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 109);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 110);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 111);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 112);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 113);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 114);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 115);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 116);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 117);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 118);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 119);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 120);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 121);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 122);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 123);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 124);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 125);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 126);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 127);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 128);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 129);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 130);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 131);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 132);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 133);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 134);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 135);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 136);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 137);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 138);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 139);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 140);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 141);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 142);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 143);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 144);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 145);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 146);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 147);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 148);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 149);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 150);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 151);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 152);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 153);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 154);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 155);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 156);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 157);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 158);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 159);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 160);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 161);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 162);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 163);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 164);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 165);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 166);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 167);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 168);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 169);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 170);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 171);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 172);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 173);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 174);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 175);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 176);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 177);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 178);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 179);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 180);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 181);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 182);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 183);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 184);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 185);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 186);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 187);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 188);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 189);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 190);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 191);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 192);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 193);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 194);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 195);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 196);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 197);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 198);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 199);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 200);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 201);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 202);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 203);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 204);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 205);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 206);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 207);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 208);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 209);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 210);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 211);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 212);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 213);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 214);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 215);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 216);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 217);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 218);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 219);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 220);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 221);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 222);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 223);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 224);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 225);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 226);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 227);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 228);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 229);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 230);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 231);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 232);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 233);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 234);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 235);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 236);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 237);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 238);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 239);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 240);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 241);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 242);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 243);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 244);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 245);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 246);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 247);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 248);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 249);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 250);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 251);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 252);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 253);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 254);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 255);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 256);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 257);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 258);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 259);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 260);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 261);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 262);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 263);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 264);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 265);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 266);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 267);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 268);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 269);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 270);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 271);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 272);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 273);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 274);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 275);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 276);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 277);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 278);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 279);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 280);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 281);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 282);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 283);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 284);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 285);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 286);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 287);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 288);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 289);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 290);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 291);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 292);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 293);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 294);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 295);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 296);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 297);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 298);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 299);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 300);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 301);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 302);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 303);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 304);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 305);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 306);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 307);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 308);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 309);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 310);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 311);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 312);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 313);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 314);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 315);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 316);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 317);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 318);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 319);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 320);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 321);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 322);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 323);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 324);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 325);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 326);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 327);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 328);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 329);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 330);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 331);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 332);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 333);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 334);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 335);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 336);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 337);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 338);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 339);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 340);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 341);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 342);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 343);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 344);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 345);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 346);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 347);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 348);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 349);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 350);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 351);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 352);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 353);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 354);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 355);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 356);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 357);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 358);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 359);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 360);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 361);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 362);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 363);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 364);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 365);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 366);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 367);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 368);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 369);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 370);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 371);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 372);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 373);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 374);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 375);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 376);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 377);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 378);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 379);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 380);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 381);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 382);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 383);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 384);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 385);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 386);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 387);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 388);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 389);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 390);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 391);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 392);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 393);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 394);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 395);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 396);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 397);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 398);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 399);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 400);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 401);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 402);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 403);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 404);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 405);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 406);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 407);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 408);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 409);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 410);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 411);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 412);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 413);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 414);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 415);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 416);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 417);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 418);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 419);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 420);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 421);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 422);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 423);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 424);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 425);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 426);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 427);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 428);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 429);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 430);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 431);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 432);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 433);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 434);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 435);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 436);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 437);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 438);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 439);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 440);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 441);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 442);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 443);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 444);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 445);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 446);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 447);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 448);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 449);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 450);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 451);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 452);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 453);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 454);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 455);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 456);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 457);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 458);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 459);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 460);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 461);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 462);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 463);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 464);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 465);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 466);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 467);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 468);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 469);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 470);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 471);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 472);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 473);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 474);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 475);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 476);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 477);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 478);

            migrationBuilder.DeleteData(
                table: "Holidays",
                keyColumn: "Id",
                keyValue: 479);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "States",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "Countries",
                keyColumn: "Id",
                keyValue: 4);
        }
    }
}
