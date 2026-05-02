using VacationOptimizer.Server.Services;

namespace VacationOptimizer.Server.CountrySpecific.Switzerland;

public static class SwitzerlandCantons
{
    public static readonly IReadOnlyList<StateInfo> All =
    [
        new("CH-AG", "Aargau"),
        new("CH-AI", "Appenzell Innerrhoden"),
        new("CH-AR", "Appenzell Ausserrhoden"),
        new("CH-BE", "Bern"),
        new("CH-BL", "Basel-Landschaft"),
        new("CH-BS", "Basel-Stadt"),
        new("CH-FR", "Fribourg"),
        new("CH-GE", "Geneva"),
        new("CH-GL", "Glarus"),
        new("CH-GR", "Grisons"),
        new("CH-JU", "Jura"),
        new("CH-LU", "Lucerne"),
        new("CH-NE", "Neuchatel"),
        new("CH-NW", "Nidwalden"),
        new("CH-OW", "Obwalden"),
        new("CH-SG", "St. Gallen"),
        new("CH-SH", "Schaffhausen"),
        new("CH-SO", "Solothurn"),
        new("CH-SZ", "Schwyz"),
        new("CH-TG", "Thurgau"),
        new("CH-TI", "Ticino"),
        new("CH-UR", "Uri"),
        new("CH-VD", "Vaud"),
        new("CH-VS", "Valais"),
        new("CH-ZG", "Zug"),
        new("CH-ZH", "Zurich"),
    ];
}
