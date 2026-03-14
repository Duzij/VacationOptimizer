using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VacationOptimizer.Server.Models;

public class Country
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(2)]
    public string IsoCode { get; set; } = string.Empty; // ISO 3166-1 alpha-2

    public ICollection<State> States { get; set; } = new List<State>();
    public ICollection<Holiday> Holidays { get; set; } = new List<Holiday>();
}

public class State
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(16)]
    public string Code { get; set; } = string.Empty;

    [Required]
    public int CountryId { get; set; }

    [ForeignKey(nameof(CountryId))]
    public Country? Country { get; set; }

    public ICollection<Holiday> Holidays { get; set; } = new List<Holiday>();
}

public class Holiday
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CountryId { get; set; }

    [ForeignKey(nameof(CountryId))]
    public Country? Country { get; set; }

    public int? StateId { get; set; }

    [ForeignKey(nameof(StateId))]
    public State? State { get; set; }

    [Required]
    public DateOnly Date { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
}
