using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class SwitzerlandSeedData
{
    public const int SwitzerlandCountryId = 6;

    private const int AargauStateId = 1;
    private const int AppenzellInnerrhodenStateId = 2;
    private const int AppenzellAusserrhodenStateId = 3;
    private const int BernStateId = 4;
    private const int BaselLandschaftStateId = 5;
    private const int BaselStadtStateId = 6;
    private const int FribourgStateId = 7;
    private const int GenevaStateId = 8;
    private const int GlarusStateId = 9;
    private const int GrisonsStateId = 10;
    private const int JuraStateId = 11;
    private const int LucerneStateId = 12;
    private const int NeuchatelStateId = 13;
    private const int NidwaldenStateId = 14;
    private const int ObwaldenStateId = 15;
    private const int StGallenStateId = 16;
    private const int SchaffhausenStateId = 17;
    private const int SolothurnStateId = 18;
    private const int SchwyzStateId = 19;
    private const int ThurgauStateId = 20;
    private const int TicinoStateId = 21;
    private const int UriStateId = 22;
    private const int VaudStateId = 23;
    private const int ValaisStateId = 24;
    private const int ZugStateId = 25;
    private const int ZurichStateId = 26;

    public static Country Country => new()
    {
        Id = SwitzerlandCountryId,
        Name = "Switzerland",
        IsoCode = "CH"
    };

    public static IReadOnlyList<State> States => new[]
    {
        new State { Id = AargauStateId, Name = "Aargau", Code = "CH-AG", CountryId = Country.Id },
        new State { Id = AppenzellInnerrhodenStateId, Name = "Appenzell Innerrhoden", Code = "CH-AI", CountryId = Country.Id },
        new State { Id = AppenzellAusserrhodenStateId, Name = "Appenzell Ausserrhoden", Code = "CH-AR", CountryId = Country.Id },
        new State { Id = BernStateId, Name = "Bern", Code = "CH-BE", CountryId = Country.Id },
        new State { Id = BaselLandschaftStateId, Name = "Basel-Landschaft", Code = "CH-BL", CountryId = Country.Id },
        new State { Id = BaselStadtStateId, Name = "Basel-Stadt", Code = "CH-BS", CountryId = Country.Id },
        new State { Id = FribourgStateId, Name = "Fribourg", Code = "CH-FR", CountryId = Country.Id },
        new State { Id = GenevaStateId, Name = "Geneva", Code = "CH-GE", CountryId = Country.Id },
        new State { Id = GlarusStateId, Name = "Glarus", Code = "CH-GL", CountryId = Country.Id },
        new State { Id = GrisonsStateId, Name = "Grisons", Code = "CH-GR", CountryId = Country.Id },
        new State { Id = JuraStateId, Name = "Jura", Code = "CH-JU", CountryId = Country.Id },
        new State { Id = LucerneStateId, Name = "Lucerne", Code = "CH-LU", CountryId = Country.Id },
        new State { Id = NeuchatelStateId, Name = "Neuchatel", Code = "CH-NE", CountryId = Country.Id },
        new State { Id = NidwaldenStateId, Name = "Nidwalden", Code = "CH-NW", CountryId = Country.Id },
        new State { Id = ObwaldenStateId, Name = "Obwalden", Code = "CH-OW", CountryId = Country.Id },
        new State { Id = StGallenStateId, Name = "St. Gallen", Code = "CH-SG", CountryId = Country.Id },
        new State { Id = SchaffhausenStateId, Name = "Schaffhausen", Code = "CH-SH", CountryId = Country.Id },
        new State { Id = SolothurnStateId, Name = "Solothurn", Code = "CH-SO", CountryId = Country.Id },
        new State { Id = SchwyzStateId, Name = "Schwyz", Code = "CH-SZ", CountryId = Country.Id },
        new State { Id = ThurgauStateId, Name = "Thurgau", Code = "CH-TG", CountryId = Country.Id },
        new State { Id = TicinoStateId, Name = "Ticino", Code = "CH-TI", CountryId = Country.Id },
        new State { Id = UriStateId, Name = "Uri", Code = "CH-UR", CountryId = Country.Id },
        new State { Id = VaudStateId, Name = "Vaud", Code = "CH-VD", CountryId = Country.Id },
        new State { Id = ValaisStateId, Name = "Valais", Code = "CH-VS", CountryId = Country.Id },
        new State { Id = ZugStateId, Name = "Zug", Code = "CH-ZG", CountryId = Country.Id },
        new State { Id = ZurichStateId, Name = "Zurich", Code = "CH-ZH", CountryId = Country.Id },
    };

    public static IReadOnlyList<Holiday> Holidays => new[]
    {
        new Holiday { Id = 75, CountryId = Country.Id, StateId = null, Date = new DateOnly(2027, 01, 01), Name = "New Year's Day" },
        new Holiday { Id = 76, CountryId = Country.Id, StateId = AargauStateId, Date = new DateOnly(2027, 01, 02), Name = "Berchtold Day" },
        new Holiday { Id = 77, CountryId = Country.Id, StateId = BernStateId, Date = new DateOnly(2027, 01, 02), Name = "Berchtold Day" },
        new Holiday { Id = 78, CountryId = Country.Id, StateId = FribourgStateId, Date = new DateOnly(2027, 01, 02), Name = "Berchtold Day" },
        new Holiday { Id = 79, CountryId = Country.Id, StateId = JuraStateId, Date = new DateOnly(2027, 01, 02), Name = "Berchtold Day" },
        new Holiday { Id = 80, CountryId = Country.Id, StateId = ThurgauStateId, Date = new DateOnly(2027, 01, 02), Name = "Berchtold Day" },
        new Holiday { Id = 81, CountryId = Country.Id, StateId = VaudStateId, Date = new DateOnly(2027, 01, 02), Name = "Berchtold Day" },
        new Holiday { Id = 82, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 01, 06), Name = "Epiphany" },
        new Holiday { Id = 83, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 01, 06), Name = "Epiphany" },
        new Holiday { Id = 84, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 01, 06), Name = "Epiphany" },
        new Holiday { Id = 85, CountryId = Country.Id, StateId = LucerneStateId, Date = new DateOnly(2027, 03, 19), Name = "Saint Joseph's Day" },
        new Holiday { Id = 86, CountryId = Country.Id, StateId = NidwaldenStateId, Date = new DateOnly(2027, 03, 19), Name = "Saint Joseph's Day" },
        new Holiday { Id = 87, CountryId = Country.Id, StateId = SolothurnStateId, Date = new DateOnly(2027, 03, 19), Name = "Saint Joseph's Day" },
        new Holiday { Id = 88, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 03, 19), Name = "Saint Joseph's Day" },
        new Holiday { Id = 89, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 03, 19), Name = "Saint Joseph's Day" },
        new Holiday { Id = 90, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 03, 19), Name = "Saint Joseph's Day" },
        new Holiday { Id = 91, CountryId = Country.Id, StateId = ValaisStateId, Date = new DateOnly(2027, 03, 19), Name = "Saint Joseph's Day" },
        new Holiday { Id = 92, CountryId = Country.Id, StateId = ZurichStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 93, CountryId = Country.Id, StateId = BernStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 94, CountryId = Country.Id, StateId = LucerneStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 95, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 96, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 97, CountryId = Country.Id, StateId = ObwaldenStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 98, CountryId = Country.Id, StateId = NidwaldenStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 99, CountryId = Country.Id, StateId = GlarusStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 100, CountryId = Country.Id, StateId = ZugStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 101, CountryId = Country.Id, StateId = FribourgStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 102, CountryId = Country.Id, StateId = SolothurnStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 103, CountryId = Country.Id, StateId = BaselStadtStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 104, CountryId = Country.Id, StateId = BaselLandschaftStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 105, CountryId = Country.Id, StateId = SchaffhausenStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 106, CountryId = Country.Id, StateId = AppenzellAusserrhodenStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 107, CountryId = Country.Id, StateId = AppenzellInnerrhodenStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 108, CountryId = Country.Id, StateId = StGallenStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 109, CountryId = Country.Id, StateId = AargauStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 110, CountryId = Country.Id, StateId = GrisonsStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 111, CountryId = Country.Id, StateId = ThurgauStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 112, CountryId = Country.Id, StateId = VaudStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 113, CountryId = Country.Id, StateId = NeuchatelStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 114, CountryId = Country.Id, StateId = GenevaStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 115, CountryId = Country.Id, StateId = JuraStateId, Date = new DateOnly(2027, 03, 26), Name = "Good Friday" },
        new Holiday { Id = 116, CountryId = Country.Id, StateId = ZurichStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 117, CountryId = Country.Id, StateId = BernStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 118, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 119, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 120, CountryId = Country.Id, StateId = GlarusStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 121, CountryId = Country.Id, StateId = FribourgStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 122, CountryId = Country.Id, StateId = BaselStadtStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 123, CountryId = Country.Id, StateId = BaselLandschaftStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 124, CountryId = Country.Id, StateId = SchaffhausenStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 125, CountryId = Country.Id, StateId = AppenzellAusserrhodenStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 126, CountryId = Country.Id, StateId = AppenzellInnerrhodenStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 127, CountryId = Country.Id, StateId = StGallenStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 128, CountryId = Country.Id, StateId = AargauStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 129, CountryId = Country.Id, StateId = GrisonsStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 130, CountryId = Country.Id, StateId = ThurgauStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 131, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 132, CountryId = Country.Id, StateId = VaudStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 133, CountryId = Country.Id, StateId = GenevaStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 134, CountryId = Country.Id, StateId = JuraStateId, Date = new DateOnly(2027, 03, 29), Name = "Easter Monday" },
        new Holiday { Id = 135, CountryId = Country.Id, StateId = BaselLandschaftStateId, Date = new DateOnly(2027, 05, 01), Name = "May Day" },
        new Holiday { Id = 136, CountryId = Country.Id, StateId = BaselStadtStateId, Date = new DateOnly(2027, 05, 01), Name = "May Day" },
        new Holiday { Id = 137, CountryId = Country.Id, StateId = JuraStateId, Date = new DateOnly(2027, 05, 01), Name = "May Day" },
        new Holiday { Id = 138, CountryId = Country.Id, StateId = NeuchatelStateId, Date = new DateOnly(2027, 05, 01), Name = "May Day" },
        new Holiday { Id = 139, CountryId = Country.Id, StateId = SchaffhausenStateId, Date = new DateOnly(2027, 05, 01), Name = "May Day" },
        new Holiday { Id = 140, CountryId = Country.Id, StateId = ZurichStateId, Date = new DateOnly(2027, 05, 01), Name = "May Day" },
        new Holiday { Id = 141, CountryId = Country.Id, StateId = ThurgauStateId, Date = new DateOnly(2027, 05, 01), Name = "May Day" },
        new Holiday { Id = 142, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 05, 01), Name = "May Day" },
        new Holiday { Id = 143, CountryId = Country.Id, StateId = null, Date = new DateOnly(2027, 05, 06), Name = "Ascension Day" },
        new Holiday { Id = 144, CountryId = Country.Id, StateId = ZurichStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 145, CountryId = Country.Id, StateId = BernStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 146, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 147, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 148, CountryId = Country.Id, StateId = GlarusStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 149, CountryId = Country.Id, StateId = FribourgStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 150, CountryId = Country.Id, StateId = BaselStadtStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 151, CountryId = Country.Id, StateId = BaselLandschaftStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 152, CountryId = Country.Id, StateId = SchaffhausenStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 153, CountryId = Country.Id, StateId = AppenzellAusserrhodenStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 154, CountryId = Country.Id, StateId = AppenzellInnerrhodenStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 155, CountryId = Country.Id, StateId = StGallenStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 156, CountryId = Country.Id, StateId = AargauStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 157, CountryId = Country.Id, StateId = GrisonsStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 158, CountryId = Country.Id, StateId = ThurgauStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 159, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 160, CountryId = Country.Id, StateId = VaudStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 161, CountryId = Country.Id, StateId = GenevaStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 162, CountryId = Country.Id, StateId = JuraStateId, Date = new DateOnly(2027, 05, 17), Name = "Pentecost Monday" },
        new Holiday { Id = 163, CountryId = Country.Id, StateId = AargauStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 164, CountryId = Country.Id, StateId = AppenzellInnerrhodenStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 165, CountryId = Country.Id, StateId = FribourgStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 166, CountryId = Country.Id, StateId = JuraStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 167, CountryId = Country.Id, StateId = LucerneStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 168, CountryId = Country.Id, StateId = NidwaldenStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 169, CountryId = Country.Id, StateId = ObwaldenStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 170, CountryId = Country.Id, StateId = SolothurnStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 171, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 172, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 173, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 174, CountryId = Country.Id, StateId = ValaisStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 175, CountryId = Country.Id, StateId = ZugStateId, Date = new DateOnly(2027, 05, 27), Name = "Corpus Christi" },
        new Holiday { Id = 176, CountryId = Country.Id, StateId = null, Date = new DateOnly(2027, 08, 01), Name = "Swiss National Day" },
        new Holiday { Id = 177, CountryId = Country.Id, StateId = AargauStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 178, CountryId = Country.Id, StateId = AppenzellInnerrhodenStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 179, CountryId = Country.Id, StateId = FribourgStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 180, CountryId = Country.Id, StateId = JuraStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 181, CountryId = Country.Id, StateId = LucerneStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 182, CountryId = Country.Id, StateId = NidwaldenStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 183, CountryId = Country.Id, StateId = ObwaldenStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 184, CountryId = Country.Id, StateId = SolothurnStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 185, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 186, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 187, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 188, CountryId = Country.Id, StateId = ValaisStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 189, CountryId = Country.Id, StateId = ZugStateId, Date = new DateOnly(2027, 08, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 190, CountryId = Country.Id, StateId = AargauStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 191, CountryId = Country.Id, StateId = AppenzellInnerrhodenStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 192, CountryId = Country.Id, StateId = FribourgStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 193, CountryId = Country.Id, StateId = GlarusStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 194, CountryId = Country.Id, StateId = JuraStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 195, CountryId = Country.Id, StateId = LucerneStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 196, CountryId = Country.Id, StateId = NidwaldenStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 197, CountryId = Country.Id, StateId = ObwaldenStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 198, CountryId = Country.Id, StateId = StGallenStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 199, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 200, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 201, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 202, CountryId = Country.Id, StateId = ValaisStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 203, CountryId = Country.Id, StateId = ZugStateId, Date = new DateOnly(2027, 11, 01), Name = "All Saints' Day" },
        new Holiday { Id = 204, CountryId = Country.Id, StateId = AppenzellInnerrhodenStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 205, CountryId = Country.Id, StateId = LucerneStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 206, CountryId = Country.Id, StateId = NidwaldenStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 207, CountryId = Country.Id, StateId = ObwaldenStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 208, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 209, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 210, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 211, CountryId = Country.Id, StateId = ValaisStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 212, CountryId = Country.Id, StateId = ZugStateId, Date = new DateOnly(2027, 12, 08), Name = "Immaculate Conception" },
        new Holiday { Id = 213, CountryId = Country.Id, StateId = null, Date = new DateOnly(2027, 12, 25), Name = "Christmas Day" },
        new Holiday { Id = 214, CountryId = Country.Id, StateId = ZurichStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 215, CountryId = Country.Id, StateId = BernStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 216, CountryId = Country.Id, StateId = LucerneStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 217, CountryId = Country.Id, StateId = UriStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 218, CountryId = Country.Id, StateId = SchwyzStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 219, CountryId = Country.Id, StateId = GlarusStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 220, CountryId = Country.Id, StateId = BaselStadtStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 221, CountryId = Country.Id, StateId = BaselLandschaftStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 222, CountryId = Country.Id, StateId = SchaffhausenStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 223, CountryId = Country.Id, StateId = AppenzellAusserrhodenStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 224, CountryId = Country.Id, StateId = AppenzellInnerrhodenStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 225, CountryId = Country.Id, StateId = StGallenStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 226, CountryId = Country.Id, StateId = GrisonsStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 227, CountryId = Country.Id, StateId = ThurgauStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
        new Holiday { Id = 228, CountryId = Country.Id, StateId = TicinoStateId, Date = new DateOnly(2027, 12, 26), Name = "St. Stephen's Day" },
    };
}