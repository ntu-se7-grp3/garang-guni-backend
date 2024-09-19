package sg.edu.ntu.garang_guni_backend.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import java.sql.Date;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Items")
public class Item {

    public Item(Item itemToBeClone) {
        this(
            itemToBeClone.getItemId(),
            itemToBeClone.getItemName(),
            itemToBeClone.getItemDescription(),
            itemToBeClone.getCreatedAt(),
            itemToBeClone.getUpdatedAt(),
            itemToBeClone.getImages()
        );
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "itemId")
    private UUID itemId;

    @NotBlank(message = "Name for item is mandatory!")
    @Column(name = "Name")
    private String itemName;

    @NotBlank(message = "Description for item is mandatory!")
    @Column(name = "Description")
    private String itemDescription;

    @Column(name = "created_at")
    @CreationTimestamp
    private Date createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private Date updatedAt;

    @JsonBackReference
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "item", cascade = CascadeType.ALL)
    private List<Image> images;

    public Date getCreatedAt() {
        return (createdAt != null) ? new Date(createdAt.getTime()) : null;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = (createdAt != null) ? new Date(createdAt.getTime()) : null;
    }

    public Date getUpdatedAt() {
        return (updatedAt != null) ? new Date(updatedAt.getTime()) : null;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = (updatedAt != null) ? new Date(updatedAt.getTime()) : null;
    }

    public List<Image> getImages() {
        return (images != null) ? images.stream().map(Image::new).toList() : null;
    }

    public void setImages(List<Image> updatedImages) {
        this.images = (updatedImages != null) ? updatedImages.stream().map(Image::new).toList() : null;
    }
}
