package sg.edu.ntu.garang_guni_backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.sql.Date;
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
@Table(name = "Images")
public class Image {

    public Image(Image imageToBeClone) {
        this(
            imageToBeClone.getImageId(),
            imageToBeClone.getImageName(),
            imageToBeClone.getImageType(),
            imageToBeClone.getCreatedAt(),
            imageToBeClone.getUpdatedAt(),
            imageToBeClone.getImageData(),
            imageToBeClone.getItem());
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "imageId")
    private UUID imageId;

    private String imageName;

    private String imageType;

    @Column(name = "created_at")
    @CreationTimestamp
    private Date createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private Date updatedAt;

    @Lob
    @Column(name = "imageData")
    private byte[] imageData;

    @ManyToOne
    @JoinColumn(name = "itemId", referencedColumnName = "itemId")
    private Item item;

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

    public byte[] getImageData() {
        return (imageData != null) ? imageData.clone() : null;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = (imageData != null) ? imageData.clone() : null;
    }
}
